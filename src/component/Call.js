import React, { useEffect, useRef } from "react";
import socket from "../socket";

const Call = ({ currentUser, selectedUser }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef();

  useEffect(() => {
    const servers = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection(servers);
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              receiverId: selectedUser,
              candidate: event.candidate,
            });
          }
        };

        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };
      });

    socket.on("offer", async ({ offer, senderId }) => {
      if (senderId === selectedUser) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit("answer", {
          receiverId: senderId,
          answer,
        });
      }
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [selectedUser]);

  const startCall = async () => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", {
      receiverId: selectedUser,
      offer,
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h2 style={{ marginBottom: "10px" }}>
        Video Call with {selectedUser}
      </h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "15px" }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          width="200"
          style={{
            backgroundColor: "#000",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          width="200"
          style={{
            backgroundColor: "#000",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <button
        onClick={startCall}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Start Call
      </button>
    </div>
  );
};

export default Call;
