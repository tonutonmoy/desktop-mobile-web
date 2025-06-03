import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket"; // Directly import the pre-initialized socket instance
import axios from "axios"; // For file uploads
import EmojiPicker from "emoji-picker-react"; // Emoji picker
import { FiMoreVertical, FiSearch, FiPaperclip, FiMic, FiSmile, FiSend, FiSquare, FiCheck, FiCheckCircle } from "react-icons/fi"; // Added FiCheck, FiCheckCircle
import { IoCall, IoVideocam } from "react-icons/io5";
import { BiArrowBack } from "react-icons/bi";
import { FaFileAlt } from "react-icons/fa"; // For file icon
import { Toaster, toast } from 'sonner'; // Import Toaster and toast from sonner
import { debounce } from 'lodash'; // For debouncing typing events

const incomingRingtone = new Audio('/sounds/incoming-call.mp3');
const outgoingRingtone = new Audio('/sounds/outgoing-call.mp3');
incomingRingtone.loop = true;
outgoingRingtone.loop = true;

const Chat = () => {
  const { partnerId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null); // Partner user details
  const [callStatus, setCallStatus] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStreamEnabled, setLocalStreamEnabled] = useState({ audio: true, video: true });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // --- Voice Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  // --- End Voice Recording State ---

  // --- Typing Indicator State ---
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  // --- End Typing Indicator State ---

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null); // For both call and recording streams
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesContainerRef = useRef(null); // Ref for the messages scroll container

  // --- Voice Recording Refs ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  // --- End Voice Recording Refs ---

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Debounced function for typing status
  const debouncedTypingStop = useCallback(
    debounce((receiverId) => { // Removed socket and senderId as arguments
      socket.emit("typing_stop", { receiverId });
    }, 1000), // Emit stop after 1 second of no typing
    []
  );

  // --- Main useEffect for Socket.IO setup and data fetching ---
  useEffect(() => {
    if (!currentUser?.id || !partnerId) {
      console.warn("Chat.tsx: currentUser.id or partnerId is missing.");
      return;
    }

    // The socket is already initialized and connected by ../socket.js
    // We just need to ensure it's ready and then join the room.
    if (!socket.connected) {
      // This case should ideally not happen if socket.js connects on import,
      // but as a fallback, we can try to connect here.
      // However, for a global socket, it's better to let the global file manage connection.
      // For now, we'll assume it's connected or will connect shortly.
      console.log("Chat.tsx: Socket not yet connected, waiting...");
    }

    // Emit join_chat_room once the component mounts and IDs are available
    socket.emit("join_chat_room", { user1Id: currentUser.id, user2Id: partnerId });
    console.log("Chat.tsx: Emitted join_chat_room with userId:", currentUser.id);

    // Event listeners for socket connection status (optional, for logging)
    const handleConnect = () => {
      console.log("Chat.tsx: Socket connected successfully with ID:", socket.id);
    };
    const handleConnectError = (err) => {
      console.error("Chat.tsx: Socket connection error:", err.message);
      toast.error(`Socket connection failed: ${err.message}`);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);


    // Fetch messages and partner details
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/messages/${currentUser.id}/${partnerId}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        const typedMessages = data.map((msg) => ({
          ...msg,
          type: msg.type || 'text', // Default to 'text' if type is missing
          isSeen: msg.isSeen || false, // Ensure isSeen property exists
        }));
        setMessages(typedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages.");
      }
    };

    const fetchPartner = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/users/${partnerId}`);
        if (!res.ok) throw new Error('Failed to fetch partner details');
        const data = await res.json();
        setUser(data?.data);
      } catch (error) {
        console.error("Error fetching partner:", error);
        toast.error("Failed to load partner details.");
      }
    };

    fetchMessages();
    fetchPartner();

    // Socket event handlers
    const handleReceiveMessage = (msg) => {
      setMessages(prev => {
        // Prevent adding duplicate messages if the server echoes them back and they already exist by ID
        // This is crucial if you optimistically add messages on send and then receive them back
        if (msg.id && prev.some(existingMsg => existingMsg.id === msg.id)) {
          return prev;
        }
        return [...prev, { ...msg, type: msg.type || 'text', isSeen: msg.isSeen || false }];
      });
    };

    const handleReceiveCall = ({ offer, caller, isVideo }) => {
      setCallStatus("incoming");
      setIncomingCall({ offer, caller, isVideo });
      incomingRingtone.play().catch(e => console.warn("Incoming ringtone play failed:", e));
    };

    const handleCallAnswered = async ({ answer }) => {
      if (!peerConnectionRef.current) return;
      outgoingRingtone.pause();
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus("ongoing");
      } catch (e) {
        console.error("Error setting remote description for answer:", e);
        toast.error("Failed to establish call connection.");
        endCall(true);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (candidate && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      }
    };

    const handleCallEnded = () => {
      incomingRingtone.pause();
      outgoingRingtone.pause();
      endCall(true); // Pass true to indicate it's a call-related stream closure
      toast.info("Call ended.");
    };

    const handleCallRejected = () => {
      outgoingRingtone.pause();
      setCallStatus("idle");
      toast.info(`${user?.firstName || "User"} is busy or rejected your call.`);
    };

    // --- New: Typing and Online/Offline Status Handlers ---
    const handlePartnerTyping = ({ senderId, isTyping }) => {
      if (senderId === partnerId) {
        setPartnerIsTyping(isTyping);
      }
    };

    const handleUserStatus = ({ userId: statusUserId, status }) => {
      if (statusUserId === partnerId) {
        setUser((prevUser) => ({ ...prevUser, isOnline: status === "online" }));
      }
    };

    const handleMessageSeenReceipt = ({ messageId, seenBy }) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId && msg.senderId === currentUser.id
            ? { ...msg, isSeen: true }
            : msg
        )
      );
    };
    // --- End: Typing and Online/Offline Status Handlers ---


    // Register socket listeners
    socket.on("receive_message", handleReceiveMessage);
    socket.on("receive_call", handleReceiveCall);
    socket.on("call_answered", handleCallAnswered);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_rejected", handleCallRejected);
    socket.on("partner_typing", handlePartnerTyping); // New listener
    socket.on("user_status", handleUserStatus);       // New listener
    socket.on("message_seen_receipt", handleMessageSeenReceipt); // New listener
    socket.on("error", (err) => { // Generic error from backend
      console.error("Socket error from server:", err.message);
      toast.error(`Server error: ${err.message}`);
    });


    // Cleanup function for useEffect
    return () => {
      // Turn off only the listeners specific to this component instance
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("receive_call", handleReceiveCall);
      socket.off("call_answered", handleCallAnswered);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_rejected", handleCallRejected);
      socket.off("partner_typing", handlePartnerTyping);
      socket.off("user_status", handleUserStatus);
      socket.off("message_seen_receipt", handleMessageSeenReceipt);
      socket.off("error");

      incomingRingtone.pause();
      outgoingRingtone.pause();
      endCall(true); // Ensure all call-related resources are cleaned up
      // Recording specific cleanup
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      debouncedTypingStop.cancel(); // Cancel any pending debounced calls
      // Do NOT call socket.disconnect() here, as the socket is global and managed externally.
    };
  }, [currentUser.id, partnerId, user?.firstName, debouncedTypingStop]); // Dependencies for this useEffect

  // Effect for scrolling to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect for handling click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Effect for message seen status (IntersectionObserver)
  useEffect(() => {
    if (!socket || !messagesContainerRef.current) return; // Use directly imported socket

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageElement = entry.target;
            const messageId = messageElement.dataset.messageId;
            const messageSenderId = messageElement.dataset.senderId;

            // Only mark as seen if the message is from the partner and not already seen
            if (messageId && messageSenderId === partnerId) {
              const messageToMark = messages.find(msg => msg.id === messageId);
              if (messageToMark && !messageToMark.isSeen) {
                socket.emit("message_seen", { messageId, senderId: partnerId }); // Use directly imported socket
              }
            }
          }
        });
      },
      {
        root: messagesContainerRef.current, // Observe within the messages container
        rootMargin: '0px',
        threshold: 0.9, // Message is considered "seen" when 90% visible
      }
    );

    // Observe only the last message from the partner that hasn't been seen yet
    const unseenPartnerMessages = messages.filter(msg => msg.senderId === partnerId && !msg.isSeen);
    if (unseenPartnerMessages.length > 0) {
      const lastUnseenPartnerMessage = unseenPartnerMessages[unseenPartnerMessages.length - 1];
      const lastUnseenPartnerMessageElement = document.querySelector(`[data-message-id="${lastUnseenPartnerMessage.id}"]`);
      if (lastUnseenPartnerMessageElement) {
        observer.observe(lastUnseenPartnerMessageElement);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [messages, partnerId, currentUser.id]); // Removed getSocket from dependencies

  const sendMessage = () => {
    if (!socket || !input.trim() || isRecording) return; // Use directly imported socket

    const msg = {
      senderId: currentUser.id,
      reciverId: partnerId,
      content: input,
      createdAt: new Date().toISOString(),
      type: "text",
    };
    socket.emit("send_message", msg);
    // Removed immediate local state update.
    // Rely on the 'receive_message' event from the backend to add it.
    setInput("");
    setShowEmojiPicker(false);
    debouncedTypingStop.cancel(); // Cancel any pending typing_stop
    socket.emit("typing_stop", { receiverId: partnerId }); // Explicitly send stop typing
  };

  // Generic file upload and message sending function
  const uploadAndSendFile = async (file, type) => {
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("upload", file);

    try {
      const res = await axios.post("http://localhost:5000/api/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { url, fileName: returnedFileName } = res.data;
      const fileMsg = {
        senderId: currentUser.id,
        reciverId: partnerId,
        content: url, // For files, content is the URL
        createdAt: new Date().toISOString(),
        type: type,
        fileName: returnedFileName || file.name,
        duration: type === 'audio' ? recordingDuration : undefined // Include duration for audio
      };

      if (socket) { // Use directly imported socket
        socket.emit("send_message", fileMsg);
      } else {
        toast.error("Socket not connected to send file message.");
      }
    } catch (error) {
      console.error(`${type} upload error:`, error);
      toast.error(`${type} upload failed. Please try again.`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) { // Always clear file input
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileType = file.type.startsWith("image/") ? "image" : "file";
    uploadAndSendFile(file, fileType);
  };

  const onEmojiClick = (emojiData) => {
    setInput(prevInput => prevInput + emojiData.emoji);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket && !isRecording && callStatus === 'idle') { // Use directly imported socket
      // Emit typing_start immediately
      socket.emit("typing_start", { receiverId: partnerId }); // Send receiverId
      // Schedule typing_stop after a delay
      debouncedTypingStop(partnerId); // Removed socket and senderId arguments
    }
  };

  // --- Voice Recording Functions ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    if (isRecording) return; // Already recording
    if (callStatus !== 'idle') {
      toast.info("Cannot record during a call.");
      return;
    }

    try {
      // Ensure any previous local stream (e.g., from a disconnected call) is stopped
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream; // Store the stream specifically for recording
      setIsRecording(true);
      setRecordingDuration(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      audioChunksRef.current = [];
      const availableMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ];
      let selectedMimeType = '';
      for (const type of availableMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error("No supported audio MIME type found for MediaRecorder.");
      }

      const currentMediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
      mediaRecorderRef.current = currentMediaRecorder;

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const finalMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: finalMimeType });
        uploadAndSendFile(audioFile, "audio");
        audioChunksRef.current = [];

        // Stop the tracks of the stream obtained specifically for recording
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
          localStreamRef.current = null;
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Recording failed: " + event.error.name + " - " + event.error.message);
        handleStopRecording(); // Attempt to stop and reset on error
      };

      mediaRecorderRef.current.start();
      console.log("Recording started with MIME type:", selectedMimeType);

    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error("Could not start recording. Please ensure microphone access is allowed and your browser supports it.");
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingDuration(0);
      // Ensure stream is stopped if it was created but recording failed to start
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // This will trigger the 'onstop' event
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingDuration(0); // Reset duration after stopping
    }
  };
  // --- End Voice Recording Functions ---

  // --- WebRTC Call Functions ---
  const endCall = (isCallRelatedCleanup = false) => {
    incomingRingtone.pause();
    outgoingRingtone.pause();

    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach(sender => {
        if (sender.track) sender.track.stop(); // Stop tracks associated with the sender
      });
      // No need to stop receiver tracks explicitly, they stop when PC closes
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local media stream only if it's a call-related cleanup
    // AND it's not currently being used for active recording.
    if (localStreamRef.current && (isCallRelatedCleanup || !isRecording)) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // Emit end_call to partner if the call was ongoing or being initiated
    if (["ongoing", "calling"].includes(callStatus) && (partnerId || incomingCall?.caller.id)) {
      if (socket) { // Use directly imported socket
        socket.emit("end_call", { partnerId: partnerId || incomingCall?.caller.id });
      }
    }
    setCallStatus("idle");
    setIncomingCall(null);
    setLocalStreamEnabled({ audio: true, video: true }); // Reset media controls
  };

  const startCall = async (isVideo) => {
    if (isRecording) {
      toast.info("Please stop recording before starting a call.");
      return;
    }
    if (callStatus !== "idle") {
      toast.info("Already in a call or call state is not idle.");
      return;
    }

    if (!socket) return; // Use directly imported socket

    try {
      setCallStatus("calling");
      outgoingRingtone.play().catch(e => console.warn("Outgoing ringtone play failed:", e));

      // Stop any existing local stream before getting a new one for the call
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      localStreamRef.current = stream; // This stream is for the call
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setLocalStreamEnabled({ audio: true, video: isVideo }); // Set initial state for controls

      const pc = new RTCPeerConnection(servers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = e => {
        if (e.candidate) socket.emit("ice_candidate", { targetUserId: partnerId, candidate: e.candidate });
      };
      pc.ontrack = e => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };
      pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          console.log("Peer connection state changed:", pc.connectionState);
          endCall(true);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call_user", { calleeId: partnerId, offer, caller: { id: currentUser.id, firstName: currentUser.firstName }, isVideo });
    } catch (err) {
      console.error("Call error:", err);
      outgoingRingtone.pause();
      endCall(true);
      toast.error("Could not start call. Check permissions and devices.");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || isRecording) {
      if (isRecording) toast.info("Please stop recording before accepting a call.");
      return;
    }
    incomingRingtone.pause();

    if (!socket) return; // Use directly imported socket

    try {
      // Stop any existing local stream before getting a new one for the call
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: incomingCall.isVideo });
      localStreamRef.current = stream; // This stream is for the call
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setLocalStreamEnabled({ audio: true, video: incomingCall.isVideo }); // Set initial state for controls

      const pc = new RTCPeerConnection(servers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = e => {
        if (e.candidate) socket.emit("ice_candidate", { targetUserId: incomingCall.caller.id, candidate: e.candidate });
      };
      pc.ontrack = e => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };
      pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          console.log("Peer connection state changed:", pc.connectionState);
          endCall(true);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer_call", { callerId: incomingCall.caller.id, answer });
      setCallStatus("ongoing");
      setIncomingCall(null);
    } catch (err) {
      console.error("Accept call error:", err);
      endCall(true);
      toast.error("Could not accept call. Check permissions and devices.");
    }
  };

  const rejectCall = () => {
    incomingRingtone.pause();
    if (incomingCall) {
      if (socket) { // Use directly imported socket
        socket.emit("reject_call", { callerId: incomingCall.caller.id });
      }
      setIncomingCall(null);
      setCallStatus("idle");
      toast.info("Call rejected.");
    }
  };

  const toggleMedia = (type) => {
    if (!localStreamRef.current) {
      toast.error(`Cannot toggle ${type}: No local stream available.`);
      return;
    }
    const tracks = localStreamRef.current.getTracks().filter(track => track.kind === type);

    if (tracks.length > 0) {
      const currentTrack = tracks[0];
      const newState = !currentTrack.enabled;
      currentTrack.enabled = newState;
      setLocalStreamEnabled(prev => ({ ...prev, [type]: newState }));

      if (type === 'video' && localVideoRef.current) {
        localVideoRef.current.style.display = newState ? 'block' : 'none';
      }
      toast.info(`${type === 'audio' ? 'Microphone' : 'Camera'} ${newState ? 'enabled' : 'disabled'}.`);
    } else {
      toast.error(`No ${type} track found to toggle.`);
    }
  };
  // --- End WebRTC Call Functions ---

  // --- Message Rendering ---
  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case "image":
        return (
          <img
            src={msg.content}
            alt={msg.fileName || "Shared image"}
            style={{ maxWidth: '15rem', maxHeight: '15rem', borderRadius: '0.375rem', marginTop: '0.25rem', marginBottom: '0.25rem', cursor: 'pointer', objectFit: 'contain' }}
            onClick={() => window.open(msg.content, "_blank")}
            onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          />
        );
      case "file":
        return (
          <a
            href={msg.content}
            target="_blank"
            rel="noopener noreferrer"
            download={msg.fileName}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'rgb(229 231 235)', borderRadius: '0.375rem', marginTop: '0.25rem', marginBottom: '0.25rem' }}
          >
            <FaFileAlt size={20} />
            <span style={{ fontSize: '0.875rem', color: 'rgb(37 99 235)', textDecorationLine: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {msg.fileName || "Download File"}
            </span>
          </a>
        );
      case "audio":
        return (
          <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
            {msg.fileName && <p style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.fileName}</p>}
            <audio controls src={msg.content} style={{ width: '100%', maxWidth: '15rem' }}>
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "text":
      default:
        return <>{msg.content}</>;
    }
  };
  // --- End Message Rendering ---

  // Basic check for user and partner IDs before rendering the main chat UI
  if (!currentUser?.id || !partnerId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'rgb(243 244 246)', color: 'rgb(75 85 99)' }}>
        <p>Please ensure you are logged in and a chat partner is selected.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'rgb(243 244 246)', fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div style={{ backgroundColor: 'rgb(4 90 73)', color: 'white', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <button style={{ display: window.innerWidth < 768 ? 'block' : 'none' }} onClick={() => window.history.back()} title="Back">
          <BiArrowBack size={20} />
        </button>
        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'white', color: 'rgb(4 90 73)', fontWeight: 'bold', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.firstName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: '1 1 0%' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{user?.firstName || "User"}</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgb(229 231 235)' }}>
            {callStatus === "ongoing"
              ? "On call"
              : partnerIsTyping
                ? "Typing..."
                : (user?.isOnline ? "Online" : "Offline")}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: 'white' }}>
          <button onClick={() => startCall(false)} disabled={callStatus !== "idle" || uploadingFile || isRecording} title="Voice Call">
            <IoCall size={20} />
          </button>
          <button onClick={() => startCall(true)} disabled={callStatus !== "idle" || uploadingFile || isRecording} title="Video Call">
            <IoVideocam size={20} />
          </button>
          <button title="Search (Not implemented)" disabled={callStatus !== "idle"}>
            <FiSearch size={20} />
          </button>
          <button title="More options (Not implemented)" disabled={callStatus !== "idle"}>
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef} // Assign ref to the scrollable container
        style={{ flex: '1 1 0%', overflowY: 'auto', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#e5ded8', backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')", backgroundSize: 'repeat' }}
      >
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            data-message-id={msg.id} // Add data attribute for IntersectionObserver
            data-sender-id={msg.senderId} // Add sender ID for observer
            style={{ display: 'flex', justifyContent: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start' }}
          >
            <div
              style={{
                borderRadius: '0.5rem',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                maxWidth: '75%',
                fontSize: '0.875rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                position: 'relative',
                backgroundColor: msg.senderId === currentUser.id ? 'rgb(220 252 231)' : 'white',
                color: 'rgb(17 24 39)',
                borderBottomRightRadius: msg.senderId === currentUser.id ? '0' : '0.5rem',
                borderBottomLeftRadius: msg.senderId === currentUser.id ? '0.5rem' : '0',
                // Responsive max-width equivalent to md:max-w-[60%]
                // Note: Direct inline media queries are not standard React inline style syntax.
                // For responsive design with inline styles, you'd typically use JavaScript to
                // dynamically apply styles based on window size, or use a CSS-in-JS library.
                // This will not work as a direct inline style in a browser without a preprocessor.
                '@media (min-width: 768px)': {
                  maxWidth: '60%',
                }
              }}
            >
              {renderMessageContent(msg)}
              <div
                style={{
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  textAlign: 'right',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.25rem',
                  color: msg.senderId === currentUser.id ? 'rgb(6 78 59 / 0.75)' : 'rgb(107 114 128 / 0.75)'
                }}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.senderId === currentUser.id && (
                  msg.isSeen ? (
                    <FiCheckCircle size={14} title="Seen" /> // Double checkmark for seen
                  ) : (
                    <FiCheck size={14} title="Delivered" /> // Single checkmark for delivered
                  )
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', backgroundColor: 'rgb(243 244 246)', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' }}>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '100%', left: '0.5rem', marginBottom: '0.5rem', zIndex: '10' }}>
            <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} height={350} width={300} />
          </div>
        )}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ color: 'rgb(107 114 128)', padding: '0.5rem', borderRadius: '9999px', transitionProperty: 'color, background-color', transitionDuration: '200ms', opacity: isRecording || callStatus !== 'idle' ? '0.5' : '1', cursor: isRecording || callStatus !== 'idle' ? 'not-allowed' : 'pointer', backgroundColor: 'transparent' }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'rgb(55 65 81)', e.currentTarget.style.backgroundColor = 'rgb(229 231 235)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'rgb(107 114 128)', e.currentTarget.style.backgroundColor = 'transparent')}
          title="Emoji"
          disabled={isRecording || callStatus !== 'idle'}
        >
          <FiSmile size={24} />
        </button>
        <input
          type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }}
          disabled={uploadingFile || isRecording || callStatus !== 'idle'}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ color: 'rgb(107 114 128)', padding: '0.5rem', borderRadius: '9999px', transitionProperty: 'color, background-color', transitionDuration: '200ms', opacity: uploadingFile || isRecording || callStatus !== 'idle' ? '0.5' : '1', cursor: uploadingFile || isRecording || callStatus !== 'idle' ? 'not-allowed' : 'pointer', backgroundColor: 'transparent' }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'rgb(55 65 81)', e.currentTarget.style.backgroundColor = 'rgb(229 231 235)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'rgb(107 114 128)', e.currentTarget.style.backgroundColor = 'transparent')}
          disabled={uploadingFile || isRecording || callStatus !== 'idle'}
          title="Attach file"
        >
          {uploadingFile ? (
            <div style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px', borderTopColor: 'rgb(5 150 105)', borderColor: 'rgb(229 231 235)', borderRadius: '9999px', animation: 'spin 1s linear infinite' }}></div>
          ) : (
            <FiPaperclip size={24} />
          )}
        </button>

        {isRecording ? (
          <div style={{ flex: '1 1 0%', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', textAlign: 'center', color: 'rgb(220 38 38)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', backgroundColor: 'white', borderRadius: '9999px', border: '1px solid rgb(209 213 219)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiMic size={20} /> Recording... {formatTime(recordingDuration)}
          </div>
        ) : (
          <input
            type="text"
            style={{ flex: '1 1 0%', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderRadius: '9999px', backgroundColor: 'white', border: '1px solid rgb(209 213 219)', outline: 'none', transitionProperty: 'background-color, border-color', transitionDuration: '200ms', opacity: uploadingFile || isRecording || callStatus !== 'idle' ? '0.5' : '1', backgroundColor: uploadingFile || isRecording || callStatus !== 'idle' ? 'rgb(229 231 235)' : 'white' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgb(16 185 129)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgb(209 213 219)')}
            value={input}
            onChange={handleInputChange} // Use new handler for typing status
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message"
            disabled={uploadingFile || isRecording || callStatus !== 'idle'}
          />
        )}

        <button
          onClick={() => {
            if (input.trim() && !isRecording) {
              sendMessage();
            } else if (!isRecording) {
              handleStartRecording();
            } else {
              handleStopRecording();
            }
          }}
          style={{
            padding: '0.5rem',
            borderRadius: '9999px',
            color: 'white',
            transitionProperty: 'background-color',
            transitionDuration: '200ms',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            backgroundColor: isRecording ? 'rgb(239 68 68)' : 'rgb(4 90 73)',
            opacity: ((uploadingFile && !isRecording) || callStatus !== 'idle') ? '0.5' : '1',
            cursor: ((uploadingFile && !isRecording) || callStatus !== 'idle') ? 'not-allowed' : 'pointer',
          }}
          onMouseOver={(e) => {
            if (!((uploadingFile && !isRecording) || callStatus !== 'idle')) {
              e.currentTarget.style.backgroundColor = isRecording ? 'rgb(202 28 28)' : 'rgb(5 119 96)';
            }
          }}
          onMouseOut={(e) => {
            if (!((uploadingFile && !isRecording) || callStatus !== 'idle')) {
              e.currentTarget.style.backgroundColor = isRecording ? 'rgb(239 68 68)' : 'rgb(4 90 73)';
            }
          }}
          disabled={(uploadingFile && !isRecording) || callStatus !== 'idle'}
          title={input.trim() && !isRecording ? "Send message" : isRecording ? "Stop recording" : "Start recording"}
        >
          {input.trim() && !isRecording ? <FiSend size={24} /> : isRecording ? <FiSquare size={24} /> : <FiMic size={24} />}
        </button>
      </div>
      {/* End Input Area */}


      {/* Video Call UI */}
      {(callStatus === "calling" || callStatus === "ongoing" || callStatus === "ringing") && (
        <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgb(0 0 0 / 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: '50', padding: '1rem' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'rgb(17 24 39)', borderRadius: '0.5rem', display: callStatus === 'ongoing' && remoteVideoRef.current?.srcObject ? 'block' : 'none' }}
            />
            {(callStatus === "calling" || callStatus === "ringing" || (callStatus === 'ongoing' && !remoteVideoRef.current?.srcObject)) && (
              <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(17 24 39)', borderRadius: '0.5rem' }}>
                <div style={{ width: '10rem', height: '10rem', backgroundColor: 'rgb(55 65 81)', color: 'rgb(74 222 128)', fontWeight: 'bold', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '3.75rem' }}>
                  {user?.firstName?.[0]?.toUpperCase() || incomingCall?.caller.firstName?.[0]?.toUpperCase() || 'P'}
                </div>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
                  {callStatus === 'calling' ? user?.firstName : incomingCall?.caller.firstName || "Partner"}
                </div>
              </div>
            )}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '10rem', height: '7.5rem', backgroundColor: 'rgb(31 41 55)', borderRadius: '0.5rem', position: 'absolute', bottom: '5rem', right: '1rem', borderWidth: '2px', borderColor: 'rgb(55 65 81)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', display: localStreamRef.current && localStreamEnabled.video && callStatus !== 'idle' ? 'block' : 'none',
              // Responsive width/height equivalent to md:w-48 md:h-36
              // Note: Direct inline media queries are not standard React inline style syntax.
              // For responsive design with inline styles, you'd typically use JavaScript to
              // dynamically apply styles based on window size, or use a CSS-in-JS library.
              // This will not work as a direct inline style in a browser without a preprocessor.
              '@media (min-width: 768px)': {
                  width: '12rem',
                  height: '9rem',
                }
              }}
            />
          </div>
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '1rem', backgroundColor: 'rgb(0 0 0 / 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
              {callStatus === "calling" && (<div style={{ fontSize: '1.25rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Calling {user?.firstName || "partner"}...</div>)}
              {callStatus === "ringing" && (<div style={{ fontSize: '1.25rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Connecting to {incomingCall?.caller?.firstName || "caller"}...</div>)}
              {callStatus === "ongoing" && (<div style={{ fontSize: '1.25rem' }}>{user?.firstName || incomingCall?.caller?.firstName || "On call"}</div>)}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => toggleMedia("audio")}
                style={{ padding: '0.75rem', borderRadius: '9999px', backgroundColor: localStreamEnabled.audio ? 'white' : 'rgb(239 68 68)', color: localStreamEnabled.audio ? 'rgb(31 41 55)' : 'white', transitionProperty: 'opacity', transitionDuration: '200ms', opacity: '1' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                title={localStreamEnabled.audio ? "Mute Mic" : "Unmute Mic"} >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {localStreamEnabled.audio ? (<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>) : (<line x1="1" y1="1" x2="23" y2="23"></line>)} <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path> <line x1="12" y1="19" x2="12" y2="23"></line> <line x1="8" y1="23" x2="16" y2="23"></line> </svg>
              </button>
              <button
                onClick={() => toggleMedia("video")}
                style={{ padding: '0.75rem', borderRadius: '9999px', backgroundColor: localStreamEnabled.video ? 'white' : 'rgb(239 68 68)', color: localStreamEnabled.video ? 'rgb(31 41 55)' : 'white', transitionProperty: 'opacity', transitionDuration: '200ms', opacity: '1' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                title={localStreamEnabled.video ? "Stop Video" : "Start Video"} >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {localStreamEnabled.video ? (<polygon points="23 7 16 12 23 17 23 7"></polygon>) : (<line x1="1" y1="1" x2="23" y2="23"></line>)} <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect> </svg>
              </button>
              <button onClick={() => endCall(true)} style={{ backgroundColor: 'rgb(220 38 38)', color: 'white', padding: '0.75rem', borderRadius: '9999px', transitionProperty: 'background-color', transitionDuration: '200ms' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(185 28 28)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(220 38 38)'} title="End Call" >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path> <line x1="23" y1="1" x2="1" y2="23"></line> </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Incoming Call Modal */}
      {callStatus === "incoming" && incomingCall && (
        <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgb(0 0 0 / 0.6)', zIndex: '60', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', textAlign: 'center', width: '100%', maxWidth: '24rem' }}>
            <div style={{ width: '6rem', height: '6rem', backgroundColor: 'rgb(220 252 231)', border: '4px solid rgb(209 250 229)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <div style={{ color: 'rgb(4 90 73)', fontSize: '2.25rem', fontWeight: 'bold' }}> {incomingCall.caller.firstName?.[0]?.toUpperCase() || 'C'} </div>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>{incomingCall.caller.firstName || "Unknown Caller"}</h2>
            <p style={{ marginBottom: '0.75rem', color: 'rgb(75 85 99)' }}>{incomingCall.isVideo ? "Incoming Video Call" : "Incoming Voice Call"}</p>
            <p style={{ marginBottom: '1.5rem', color: 'rgb(107 114 128)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Ringing...</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
              <button onClick={rejectCall} style={{ backgroundColor: 'rgb(220 38 38)', color: 'white', padding: '1rem', borderRadius: '9999px', transitionProperty: 'background-color', transitionDuration: '200ms' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(185 28 28)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(220 38 38)'} title="Reject Call" >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path> <line x1="23" y1="1" x2="1" y2="23"></line> </svg>
              </button>
              <button onClick={acceptCall} style={{ backgroundColor: 'rgb(4 120 87)', color: 'white', padding: '1rem', borderRadius: '9999px', transitionProperty: 'background-color', transitionDuration: '200ms' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(5 119 96)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(4 120 87)'} title="Accept Call" >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path> </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;