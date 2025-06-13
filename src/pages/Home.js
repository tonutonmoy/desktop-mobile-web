import React, { useState, useEffect } from 'react';
import axios from 'axios'; // নিশ্চিত করুন যে axios ইনস্টল করা আছে: npm install axios

// গুরুত্বপূর্ণ: নিশ্চিত করুন যে এই API_BASE_URL আপনার ব্যাকএন্ডের বেস URL এর সাথে মেলে।
// ব্যবহারকারীর দেওয়া Home কম্পোনেন্ট সম্পূর্ণ URL ব্যবহার করে, তাই সামঞ্জস্যপূর্ণ রাখা হয়েছে।
const API_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Post কম্পোনেন্ট: প্রতিটি পোস্টের বিবরণ দেখায়, লাইক এবং কমেন্ট পরিচালনা করে।
 * @param {object} props - কম্পোনেন্টের প্রপস
 * @param {string} props.postId - পোস্টের আইডি যা প্রদর্শন করতে হবে।
 * @param {string} props.currentUserId - বর্তমানে লগইন করা ব্যবহারকারীর আইডি।
 * @param {string} props.token - বর্তমান ব্যবহারকারীর অথেন্টিকেশন টোকেন।
 * @param {function} props.onPostDeleted - পোস্ট ডিলিট হলে কল করার জন্য ফাংশন।
 * @param {function} props.onPostUpdated - পোস্ট আপডেট হলে কল করার জন্য ফাংশন।
 */
const Post = ({ postId, currentUserId, token, onPostDeleted, onPostUpdated }) => {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  // মোডাল এবং স্লাইডার সম্পর্কিত স্টেট
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // রিপ্লাই সম্পর্কিত স্টেট
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyingToAuthorName, setReplyingToAuthorName] = useState('');

  // পোস্ট এডিটিং সম্পর্কিত স্টেট
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [editedPostTitle, setEditedPostTitle] = useState(''); // Assuming posts can have titles

  // কমেন্ট এডিটিং সম্পর্কিত স্টেট
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');

  // ডিলিট নিশ্চিতকরণ মোডাল
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // 'post' or {type: 'comment', id: 'commentId'}

  // postId বা currentUserId পরিবর্তিত হলে পোস্টের বিবরণ ফেচ করার জন্য ইফেক্ট
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!postId) {
        setError('ত্রুটি: পোস্ট আইডি অনুপস্থিত। পোস্ট লোড করা যাবে না।');
        setLoading(false);
        console.error('পোস্ট আইডি অনির্ধারিত। নিশ্চিত করুন যে Post কম্পোনেন্টে একটি বৈধ postId পাঠানো হয়েছে।');
        return;
      }

      if (!token) {
        // console.warn('টোকেন অনুপস্থিত। কিছু বৈশিষ্ট্য (যেমন, লাইক, কমেন্ট) সঠিকভাবে কাজ নাও করতে পারে।');
        // এখানে এরর সেট করার দরকার নেই, Home কম্পোনেন্ট পোস্ট ফেচ করার জন্য টোকেন চেক করে।
      }

      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/posts/${postId}`;
        // console.log('পোস্ট ফেচ করার চেষ্টা হচ্ছে:', url);

        const headers = token ? { Authorization: token } : {}; // টোকেন থাকলে অথরাইজেশন হেডার যোগ করুন

        const postResponse = await axios.get(url, { headers });

        if (postResponse.status !== 200) {
          throw new Error(
            `পোস্ট ফেচ করতে ব্যর্থ: ${postResponse.status} - ${postResponse.statusText}`
          );
        }
        const postResult = postResponse.data;
        // console.log('ফেচ করা পোস্টের ডেটা:', postResult);

        // ধরে নিচ্ছি postResult.data তে প্রকৃত পোস্ট অবজেক্ট রয়েছে
        if (postResult && postResult.data) {
          setPostData(postResult.data);
          setEditedPostContent(postResult.data.content || '');
          setEditedPostTitle(postResult.data.title || '');

          // বর্তমান ব্যবহারকারী এই পোস্টটি লাইক করেছেন কিনা তা পরীক্ষা করুন
          const userLikedThisPost = postResult.data.likes?.some(
            (like) => like.authorId === currentUserId
          );
          setLiked(userLikedThisPost);
          setLikeCount(postResult.data.likes?.length || 0);

          setComments(postResult.data.comments || []);
        } else {
          console.error(
            'ফেচ করা ডেটা স্ট্রাকচার প্রত্যাশিত নয়:',
            postResult
          );
          throw new Error('পোস্টের জন্য অবৈধ ডেটা স্ট্রাকচার পাওয়া গেছে।');
        }
      } catch (err) {
        console.error('পোস্টের বিবরণ ফেচ করতে ত্রুটি:', err);
        setError(
          `পোস্ট লোড করতে ব্যর্থ: ${err.message}. আরও বিশদ বিবরণের জন্য কনসোল পরীক্ষা করুন।`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId, currentUserId, token]); // postId, currentUserId, অথবা টোকেন পরিবর্তন হলে আবার ফেচ করুন

  /**
   * পোস্টের লাইক স্ট্যাটাস টগল করে।
   */
  const toggleLike = async () => {
    if (!currentUserId || !token) {
      console.warn('ব্যবহারকারী প্রমাণীকৃত নয়। লাইক/আনলাইক করা যাবে না।');
      setError('ত্রুটি: ব্যবহারকারী লাইক/আনলাইক করার জন্য প্রমাণীকৃত নয়।');
      return;
    }
    if (!postId) {
      console.warn('পোস্ট আইডি অনুপস্থিত। লাইক টoggle করা যাবে না।');
      setError('ত্রুটি: লাইক টoggle করা যাবে না, পোস্ট আইডি অনুপস্থিত।');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token, // প্রপ হিসাবে পাঠানো টোকেন ব্যবহার করুন
      };

      let response;
      if (liked) {
        // যদি ইতিমধ্যে লাইক করা থাকে, DELETE রিকোয়েস্ট পাঠান
        response = await axios.delete(`${API_BASE_URL}/likes`, {
          headers: headers,
          data: { postId }, // বডিসহ DELETE এর জন্য, axios-এ ডেটা অপশন ব্যবহার করা হয়
        });
      } else {
        // যদি লাইক করা না থাকে, POST রিকোয়েস্ট পাঠান
        response = await axios.post(
          `${API_BASE_URL}/likes`,
          { postId },
          { headers }
        );
      }

      if (response.status === 200 || response.status === 201) {
        setLiked(!liked);
        setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));
      } else if (response.status === 409 && !liked) {
        // ব্যবহারকারী ইতিমধ্যে লাইক করা পোস্টে লাইক করার চেষ্টা করলে তা হ্যান্ডেল করুন
        console.warn('আপনি ইতিমধ্যে এই পোস্টটি লাইক করেছেন।');
        setLiked(true); // নিশ্চিত করুন যে লাইকড স্টেট সত্য
      } else {
        throw new Error(
          `লাইক টtoggle করতে ব্যর্থ: ${response.status} - ${response.statusText}`
        );
      }
    } catch (err) {
      console.error('লাইক টtoggle করতে ত্রুটি:', err);
      // HTTP ত্রুটির জন্য আরও সুনির্দিষ্ট ত্রুটি বার্তা
      const errorMessage = err.response?.data?.message || err.message;
      setError(`লাইক প্রক্রিয়া করতে ব্যর্থ: ${errorMessage}`);
    }
  };

  /**
   * পোস্টে একটি নতুন কমেন্ট সাবমিট করে।
   */
  const submitComment = async (e) => {
    e.preventDefault();
    if (commentInput.trim() === '') return; // খালি কমেন্ট সাবমিট করবেন না

    if (!currentUserId || !token) {
      console.warn('ব্যবহারকারী প্রমাণীকৃত নয়। কমেন্ট করা যাবে না।');
      setError('ত্রুটি: ব্যবহারকারী কমেন্ট করার জন্য প্রমাণীকৃত নয়।');
      return;
    }
    if (!postId) {
      console.warn('পোস্ট আইডি অনুপস্থিত। কমেন্ট সাবমিট করা যাবে না।');
      setError('ত্রুটি: কমেন্ট সাবমিট করা যাবে না, পোস্ট আইডি অনুপস্থিত।');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token, // প্রপ হিসাবে পাঠানো টোকেন ব্যবহার করুন
      };

      const response = await axios.post(
        `${API_BASE_URL}/comments`,
        {
          postId: postId,
          content: commentInput.trim(),
        },
        { headers }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          `কমেন্ট সাবমিট করতে ব্যর্থ: ${response.status} - ${response.statusText}`
        );
      }

      const newCommentResult = response.data;
      // console.log('নতুন কমেন্ট পাওয়া গেছে:', newCommentResult.data);

      // স্থানীয় স্টেটে নতুন কমেন্ট যোগ করুন
      setComments((prevComments) => [...prevComments, newCommentResult.data]);
      setCommentInput(''); // কমেন্ট ইনপুট ফিল্ড পরিষ্কার করুন
      setReplyingToCommentId(null); // রিপ্লাই মোড বন্ধ করুন
      setReplyingToAuthorName(''); // রিপ্লাই অথর নাম পরিষ্কার করুন
    } catch (err) {
      console.error('কমেন্ট সাবমিট করতে ত্রুটি:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`কমেন্ট সাবমিট করতে ব্যর্থ: ${errorMessage}`);
    }
  };

  /**
   * পোস্ট শেয়ার করার লজিক পরিচালনা করে (আপাতত প্লেসহোল্ডার)।
   */
  const handleShare = () => {
    console.log('পোস্ট শেয়ার করা হয়েছে!');
    // এখানে আসল শেয়ার কার্যকারিতা প্রয়োগ করুন (যেমন, সোশ্যাল মিডিয়ায় শেয়ার, লিঙ্ক কপি)
  };

  // মোডাল খোলার ফাংশন
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  // মোডাল বন্ধ করার ফাংশন
  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // স্লাইডারে পরবর্তী ছবিতে যাওয়ার ফাংশন
  const goToNextImage = () => {
    if (postData?.imageUrl?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % postData.imageUrl.length
      );
    }
  };

  // স্লাইডারে পূর্ববর্তী ছবিতে যাওয়ার ফাংশন
  const goToPrevImage = () => {
    if (postData?.imageUrl?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex - 1 + postData.imageUrl.length) % postData.imageUrl.length
      );
    }
  };

  // একটি কমেন্টের রিপ্লাই বাটনে ক্লিক হ্যান্ডলার
  const handleReplyClick = (commentId, authorFirstName, authorLastName) => {
    setReplyingToCommentId(commentId);
    setReplyingToAuthorName(`${authorFirstName || ''} ${authorLastName || ''}`.trim());
    setCommentInput(`@${authorFirstName || ''} `); // ইনপুট @mention দিয়ে পূরণ করুন
    // ঐচ্ছিক: কমেন্ট ইনপুট ফিল্ডে ফোকাস করুন
    document.getElementById(`comment-input-${postId}`)?.focus();
  };

  // রিপ্লাই মোড বাতিল করার ফাংশন
  const cancelReply = () => {
    setReplyingToCommentId(null);
    setReplyingToAuthorName('');
    setCommentInput('');
  };

  // পোস্ট এডিটিং মোড শুরু করুন
  const startEditingPost = () => {
    setIsEditingPost(true);
    setEditedPostContent(postData.content || '');
    setEditedPostTitle(postData.title || '');
  };

  // পোস্ট এডিটিং বাতিল করুন
  const cancelEditingPost = () => {
    setIsEditingPost(false);
    setEditedPostContent(postData.content || ''); // মূল কন্টেন্টে ফিরে যান
    setEditedPostTitle(postData.title || ''); // মূল টাইটেলে ফিরে যান
  };

  // পোস্ট আপডেট জমা দিন
  const handlePostUpdate = async () => {
    if (!currentUserId || !token) {
      setError('ত্রুটি: ব্যবহারকারী প্রমাণীকৃত নয়। পোস্ট আপডেট করা যাবে না।');
      return;
    }
    if (!postId) {
      setError('ত্রুটি: পোস্ট আইডি অনুপস্থিত। পোস্ট আপডেট করা যাবে না।');
      return;
    }
    if (!editedPostContent.trim() && !editedPostTitle.trim()) {
      setError('পোস্টের বিষয়বস্তু বা শিরোনাম খালি হতে পারে না।');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token,
      };

      const response = await axios.put(
        `${API_BASE_URL}/posts/${postId}`,
        {
          content: editedPostContent.trim(),
          title: editedPostTitle.trim(), // যদি টাইটেল থাকে
        },
        { headers }
      );

      if (response.status === 200) {
        setPostData((prevData) => ({
          ...prevData,
          content: editedPostContent.trim(),
          title: editedPostTitle.trim(),
        }));
        setIsEditingPost(false); // এডিটিং মোড থেকে বেরিয়ে আসুন
        if (onPostUpdated) {
          onPostUpdated(response.data.data || response.data.post); // আপডেট করা পোস্টটি পাঠান
        }
      } else {
        throw new Error(
          `পোস্ট আপডেট করতে ব্যর্থ: ${response.status} - ${response.statusText}`
        );
      }
    } catch (err) {
      console.error('পোস্ট আপডেট করতে ত্রুটি:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`পোস্ট আপডেট করতে ব্যর্থ: ${errorMessage}`);
    }
  };

  // পোস্ট ডিলিট করার অনুরোধ
  const handleDeletePost = () => {
    setItemToDelete({ type: 'post', id: postId });
    setShowDeleteConfirmation(true);
  };

  // কমেন্ট ডিলিট করার অনুরোধ
  const handleDeleteComment = (commentId) => {
    setItemToDelete({ type: 'comment', id: commentId });
    setShowDeleteConfirmation(true);
  };

  // আইটেম ডিলিট নিশ্চিত করুন
  const confirmDeletion = async () => {
    setShowDeleteConfirmation(false);
    if (!itemToDelete) return;

    if (!currentUserId || !token) {
      setError('ত্রুটি: ব্যবহারকারী প্রমাণীকৃত নয়। ডিলিট করা যাবে না।');
      return;
    }

    try {
      const headers = {
        Authorization: token,
      };

      if (itemToDelete.type === 'post') {
        const response = await axios.delete(`${API_BASE_URL}/posts/${itemToDelete.id}`, { headers });
        if (response.status === 200 || response.status === 204) {
          if (onPostDeleted) {
            onPostDeleted(itemToDelete.id); // হোম কম্পোনেন্টকে পোস্ট ডিলিট হওয়ার কথা জানান
          }
          // পোস্টটি নিজেই রেন্ডার করা বন্ধ হয়ে যাবে যেহেতু এটি Home কম্পোনেন্ট থেকে মুছে যাবে
        } else {
          throw new Error(`পোস্ট ডিলিট করতে ব্যর্থ: ${response.status} - ${response.statusText}`);
        }
      } else if (itemToDelete.type === 'comment') {
        const response = await axios.delete(`${API_BASE_URL}/comments/${itemToDelete.id}`, { headers });
        if (response.status === 200 || response.status === 204) {
          setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== itemToDelete.id)
          );
        } else {
          throw new Error(`কমেন্ট ডিলিট করতে ব্যর্থ: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error(`ডিলিট করতে ত্রুটি:`, err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`ডিলিট করতে ব্যর্থ: ${errorMessage}`);
    } finally {
      setItemToDelete(null); // ডিলিট আইটেম রিসেট করুন
    }
  };

  // ডিলিট বাতিল করুন
  const cancelDeletion = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  // কমেন্ট এডিটিং মোড শুরু করুন
  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentContent(comment.content);
  };

  // কমেন্ট এডিটিং বাতিল করুন
  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditedCommentContent('');
  };

  // কমেন্ট আপডেট জমা দিন
  const handleCommentUpdate = async (commentId) => {
    if (!currentUserId || !token) {
      setError('ত্রুটি: ব্যবহারকারী প্রমাণীকৃত নয়। কমেন্ট আপডেট করা যাবে না।');
      return;
    }
    if (!commentId || !editedCommentContent.trim()) {
      setError('কমেন্টের বিষয়বস্তু খালি হতে পারে না।');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token,
      };

      const response = await axios.put(
        `${API_BASE_URL}/comments/${commentId}`,
        { content: editedCommentContent.trim() },
        { headers }
      );

      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments.map((c) =>
            c.id === commentId ? { ...c, content: editedCommentContent.trim() } : c
          )
        );
        setEditingCommentId(null); // এডিটিং মোড থেকে বেরিয়ে আসুন
        setEditedCommentContent('');
      } else {
        throw new Error(
          `কমেন্ট আপডেট করতে ব্যর্থ: ${response.status} - ${response.statusText}`
        );
      }
    } catch (err) {
      console.error('কমেন্ট আপডেট করতে ত্রুটি:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`কমেন্ট আপডেট করতে ব্যর্থ: ${errorMessage}`);
    }
  };


  // লোডিং বার্তা প্রদর্শন করুন
  if (loading) {
    return (
      <div
        style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#555' }}
      >
        পোস্ট লোড হচ্ছে...
      </div>
    );
  }

  // ত্রুটি বার্তা প্রদর্শন করুন
  if (error) {
    return (
      <div
        style={{ textAlign: 'center', color: 'red', padding: '20px', fontSize: '16px' }}
      >
        ত্রুটি: {error}
      </div>
    );
  }

  // যদি পোস্টের ডেটা উপলব্ধ না থাকে তবে বার্তা প্রদর্শন করুন
  if (!postData) {
    return (
      <div
        style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#555' }}
      >
        পোস্ট পাওয়া যায়নি। নিশ্চিত করুন যে postId সঠিক।
      </div>
    );
  }

  // পোস্টের ডেটা ডিস্ট্রাকচার করুন (দ্রষ্টব্য: 'imageUrl' স্কিমা অনুযায়ী একটি অ্যারে, 'title' অনুপস্থিত থাকতে পারে)
  const { content, imageUrl, author, createdAt } = postData;
  const postTitle = postData.title; // যদি থাকে তবে নিরাপদে টাইটেল অ্যাক্সেস করুন
  const isPostAuthor = currentUserId === author?.id; // পোস্টের লেখক কিনা তা পরীক্ষা করুন

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* পোস্ট হেডার */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <img
          src={author?.profileImage || 'https://placehold.co/48x48/CCCCCC/000000?text=User'}
          alt={author?.firstName || 'User'}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '12px',
          }}
        />
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '16px', color: '#050505' }}>
            {author?.firstName} {author?.lastName}
          </div>
          <div style={{ fontSize: '12px', color: '#65676b' }}>
            {new Date(createdAt).toLocaleString()}
          </div>
        </div>
        {isPostAuthor && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isEditingPost && (
              <button
                onClick={startEditingPost}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#1877f2',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDeletePost}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#dc3545',
                fontSize: '12px',
                fontWeight: '600',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* পোস্টের শিরোনাম (শর্তসাপেক্ষে রেন্ডার করা হয়) */}
      {isEditingPost ? (
        <input
          type="text"
          value={editedPostTitle}
          onChange={(e) => setEditedPostTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #dddfe2',
            outline: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        />
      ) : (
        postTitle && (
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#050505', marginBottom: '8px' }}>
            {postTitle}
          </div>
        )
      )}

      {/* পোস্টের বিষয়বস্তু (শর্তসাপেক্ষে রেন্ডার করা হয়) */}
      {isEditingPost ? (
        <textarea
          value={editedPostContent}
          onChange={(e) => setEditedPostContent(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #dddfe2',
            outline: 'none',
            fontSize: '15px',
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        content && (
          <div style={{ fontSize: '15px', color: '#050505', marginBottom: (imageUrl && imageUrl.length > 0) ? '12px' : '0' }}>
            {content}
          </div>
        )
      )}

      {isEditingPost && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={cancelEditingPost}
            style={{
              padding: '8px 16px',
              backgroundColor: '#65676b',
              color: '#fff',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePostUpdate}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1877f2',
              color: '#fff',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s',
            }}
          >
            Save
          </button>
        </div>
      )}


      {/* পোস্টের ছবি (শর্তসাপেক্ষে রেন্ডার করা হয় এবং পুনরাবৃত্ত হয়) */}
      {imageUrl && imageUrl.length > 0 && !isEditingPost && ( // এডিটিং মোডে ছবি দেখাবেন না (সম্পাদনার জন্য আলাদা লজিক প্রয়োজন হবে, যা এই স্কোপের বাইরে)
        <div style={{ marginBottom: '12px' }}>
          {/* ছবির সংখ্যা অনুযায়ী শর্তসাপেক্ষে রেন্ডারিং */}
          {imageUrl.length === 1 && (
            <img
              src={imageUrl[0]}
              alt="পোস্টের ছবি ১"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px', // একক ছবির জন্য সামঞ্জস্যপূর্ণ উচ্চতা
                borderRadius: '8px',
                objectFit: 'cover',
                cursor: 'pointer' // ছবি ক্লিকযোগ্য করুন
              }}
              onClick={() => openImageModal(0)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/600x400/CCCCCC/000000?text=Image+1`;
              }}
            />
          )}

          {imageUrl.length === 2 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {imageUrl.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`পোস্টের ছবি ${index + 1}`}
                  style={{
                    width: '50%', // প্রতিটি ৫০% প্রস্থ নেবে
                    height: '250px', // ২-ছবির লেআউটে সামঞ্জস্যপূর্ণ উচ্চতা
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer' // ছবি ক্লিকযোগ্য করুন
                  }}
                  onClick={() => openImageModal(index)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/300x250/CCCCCC/000000?text=Image+${index + 1}`;
                  }}
                />
              ))}
            </div>
          )}

          {imageUrl.length === 3 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {/* প্রথম ছবি প্রায় ৬০% প্রস্থ নেবে, ডানদিকে দুটি ৪০% প্রস্থ নেবে এবং উল্লম্বভাবে সাজানো থাকবে */}
              <img
                src={imageUrl[0]}
                alt="পোস্টের ছবি ১"
                style={{
                  width: '60%',
                  height: '350px', // প্রধান ছবির জন্য বড় উচ্চতা
                  borderRadius: '8px',
                  objectFit: 'cover',
                  marginRight: '4px',
                  cursor: 'pointer' // ছবি ক্লিকযোগ্য করুন
                }}
                onClick={() => openImageModal(0)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/360x350/CCCCCC/000000?text=Image+1`;
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '40%' }}>
                <img
                  src={imageUrl[1]}
                  alt="পোস্টের ছবি ২"
                  style={{
                    width: '100%',
                    height: '173px', // প্রধান ছবির উচ্চতার প্রায় অর্ধেক (ফাঁকা স্থান বিবেচনা করে)
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer' // ছবি ক্লিকযোগ্য করুন
                  }}
                  onClick={() => openImageModal(1)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/240x173/CCCCCC/000000?text=Image+2`;
                  }}
                />
                <img
                  src={imageUrl[2]}
                  alt="পোস্টের ছবি ৩"
                  style={{
                    width: '100%',
                    height: '173px', // প্রধান ছবির উচ্চতার প্রায় অর্ধেক (ফাঁকা স্থান বিবেচনা করে)
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer' // ছবি ক্লিকযোগ্য করুন
                  }}
                  onClick={() => openImageModal(2)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/240x173/CCCCCC/000000?text=Image+3`;
                  }}
                />
              </div>
            </div>
          )}

          {imageUrl.length === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
              {imageUrl.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`পোস্টের ছবি ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '200px', // সামঞ্জস্যপূর্ণ গ্রিড লুকের জন্য স্থির উচ্চতা
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer' // ছবি ক্লিকযোগ্য করুন
                  }}
                  onClick={() => openImageModal(index)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/300x200/CCCCCC/000000?text=Image+${index + 1}`;
                  }}
                />
              ))}
            </div>
          )}

          {imageUrl.length > 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
              {imageUrl.slice(0, 4).map((imgSrc, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={imgSrc}
                    alt={`পোস্টের ছবি ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px', // সামঞ্জস্যপূর্ণ গ্রিড লুকের জন্য স্থির উচ্চতা
                      borderRadius: '8px',
                      objectFit: 'cover',
                      cursor: 'pointer' // ছবি ক্লিকযোগ্য করুন
                    }}
                    onClick={() => openImageModal(index)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/300x200/CCCCCC/000000?text=Image+${index + 1}`;
                    }}
                  />
                  {index === 3 && imageUrl.length > 4 && ( // আরও ছবি থাকলে কেবল শেষ দৃশ্যমান ছবিতে ওভারলে প্রয়োগ করুন
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2em',
                        fontWeight: 'bold',
                        cursor: 'pointer' // ওভারলে ক্লিকযোগ্য করুন
                      }}
                      onClick={() => openImageModal(index)} // মোডাল খুলতে ক্লিক হ্যান্ডলার
                    >
                      +{imageUrl.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* পোস্ট অ্যাকশন (লাইক, কমেন্ট, শেয়ার) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '12px',
          borderTop: '1px solid #dddfe2',
          paddingTop: '8px',
          color: liked ? '#1877f2' : '#65676b',
          fontWeight: '600',
          fontSize: '14px',
          userSelect: 'none',
        }}
      >
        <button
          onClick={toggleLike}
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: liked ? '#1877f2' : '#65676b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
        >
          👍 লাইক {likeCount > 0 && `(${likeCount})`}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: '#65676b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
        >
          💬 কমেন্ট {comments.length > 0 && `(${comments.length})`}
        </button>
        <button
          onClick={handleShare}
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: '#65676b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
        >
          ↗ শেয়ার
        </button>
      </div>

      {/* কমেন্ট সেকশন */}
      {showComments && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #dddfe2', paddingTop: '12px' }}>
          {/* কমেন্ট তালিকা */}
          <div style={{ marginTop: '12px' }}>
            {comments.length === 0 ? (
              <div style={{ color: '#65676b', fontStyle: 'italic', fontSize: '14px' }}>এখনও কোনো কমেন্ট নেই।</div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id} // ধরে নিচ্ছি কমেন্টের একটি 'id' আছে
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start', // আইটেমগুলিকে উপরে সারিবদ্ধ করুন
                    marginBottom: '8px',
                    gap: '8px', // অবতার এবং কমেন্ট বাবলের মধ্যে ফাঁকা স্থান
                  }}
                >
                  {/* কমেন্ট লেখকের অবতার */}
                  <img
                    src={comment.author?.profileImage || 'https://placehold.co/32x32/D3D3D3/000000?text=C'}
                    alt={comment.author?.firstName || 'Commenter'}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0, // অবতারকে সংকুচিত হতে বাধা দিন
                    }}
                  />
                  {/* কমেন্ট বাবল */}
                  <div
                    style={{
                      backgroundColor: '#f0f2f5',
                      padding: '8px 12px',
                      borderRadius: '18px', // বাবল প্রভাবের জন্য আরও গোলাকার
                      flexGrow: 1, // কমেন্ট বাবলকে উপলব্ধ স্থান নিতে দিন
                      minWidth: '0', // বিষয়বস্তুকে র‍্যাপ করার অনুমতি দিন
                    }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>
                      {comment.author?.firstName} {comment.author?.lastName}
                    </div>
                    {editingCommentId === comment.id ? (
                      <textarea
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: '1px solid #dddfe2',
                          outline: 'none',
                          fontSize: '14px',
                          minHeight: '40px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '14px', color: '#050505', wordBreak: 'break-word' }}>
                        {comment.content}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#65676b', marginTop: '4px' }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                    {/* রিপ্লাই, এডিট, ডিলিট বাটন প্রতিটি কমেন্টের জন্য */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {editingCommentId === comment.id ? (
                        <>
                          <button
                            onClick={cancelEditingComment}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#65676b',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              padding: '2px 0',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCommentUpdate(comment.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#1877f2',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              padding: '2px 0',
                            }}
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReplyClick(comment.id, comment.author?.firstName, comment.author?.lastName)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#65676b',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              padding: '2px 0',
                            }}
                          >
                            Reply
                          </button>
                          {currentUserId === comment.authorId && (
                            <>
                              <button
                                onClick={() => startEditingComment(comment)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#65676b',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  padding: '2px 0',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc3545',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  padding: '2px 0',
                                }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* রিপ্লাই/কমেন্ট ইনপুট ফর্ম */}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '8px', marginBottom: '12px', marginTop: '12px' }}>
            <input
              id={`comment-input-${postId}`} // ফোকাসের জন্য ইউনিক আইডি
              type="text"
              placeholder={replyingToCommentId ? `Replying to ${replyingToAuthorName}...` : "একটি কমেন্ট লিখুন..."}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid #dddfe2',
                outline: 'none',
                fontSize: '14px',
              }}
            />
            {replyingToCommentId && (
              <button
                type="button"
                onClick={cancelReply}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc3545', // বাতিলের জন্য লাল রঙ
                  color: '#fff',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#1877f2',
                color: '#fff',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
            >
              পোস্ট করুন
            </button>
          </form>
        </div>
      )}

      {/* ইমেজ মোডাল */}
      {showImageModal && postData?.imageUrl?.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          {/* ক্লোজ বাটন */}
          <button
            onClick={closeImageModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '2em',
              cursor: 'pointer',
              zIndex: 1001,
            }}
          >
            &times;
          </button>

          {/* নেক্সট বাটন */}
          {postData.imageUrl.length > 1 && (
            <button
              onClick={goToPrevImage}
              style={{
                position: 'absolute',
                left: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.5em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
              }}
            >
              &#8249;
            </button>
          )}

          {/* ইমেজ */}
          <img
            src={postData.imageUrl[currentImageIndex]}
            alt={`স্লাইডার ইমেজ ${currentImageIndex + 1}`}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/800x600/CCCCCC/000000?text=Image+Error`;
            }}
          />

          {/* প্রিভিয়াস বাটন */}
          {postData.imageUrl.length > 1 && (
            <button
              onClick={goToNextImage}
              style={{
                position: 'absolute',
                right: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.5em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
              }}
            >
              &#8250;
            </button>
          )}
        </div>
      )}

      {/* ডিলিট নিশ্চিতকরণ মোডাল */}
      {showDeleteConfirmation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
              width: '300px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <p style={{ marginBottom: '20px', fontSize: '16px' }}>
              আপনি কি নিশ্চিত যে আপনি এটি ডিলিট করতে চান?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={cancelDeletion}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#65676b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s',
                }}
              >
                বাতিল করুন
              </button>
              <button
                onClick={confirmDeletion}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s',
                }}
              >
                ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Home কম্পোনেন্ট: পোস্ট তৈরি পরিচালনা করে এবং পোস্টের একটি ফিড প্রদর্শন করে।
 */
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]); // নতুন স্টেট: আপলোড করা ছবির URL সংরক্ষণ করবে
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postCreationLoading, setPostCreationLoading] = useState(false);
  const [isUploadingIndividualImage, setIsUploadingIndividualImage] = useState(false); // একটি করে ছবি আপলোডের জন্য লোডিং স্টেট
  const [postCreationMessage, setPostCreationMessage] = useState('');
  const [postCreationMessageType, setPostCreationMessageType] = useState(''); // 'success' অথবা 'error'

  // কম্পোনেন্ট মাউন্ট হওয়ার সময় localStorage থেকে ব্যবহারকারী এবং টোকেন ফেচ করুন
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.accessToken && user.id) {
        setToken(user.accessToken);
        setCurrentUserId(user.id);
      } else {
        console.warn('localStorage-এ ব্যবহারকারীর ডেটা বা টোকেন পাওয়া যায়নি। অনুগ্রহ করে লগইন করুন।');
        // ঐচ্ছিকভাবে, এখানে লগইন পৃষ্ঠায় রিডাইরেক্ট করতে পারেন
      }
    } catch (e) {
      console.error('localStorage থেকে ব্যবহারকারীকে পার্স করতে ব্যর্থ হয়েছে', e);
    }
  }, []);

  // টোকেন উপলব্ধ হলে বা পরিবর্তিত হলে পোস্ট ফেচ করুন
  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) {
        setLoadingPosts(false); // টোকেন না থাকলে লোডিং বন্ধ করুন
        return;
      }
      setLoadingPosts(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/posts`, {
          headers: {
            Authorization: token,
          },
        });
        // ধরে নিচ্ছি API একটি 'data' কী সহ একটি অবজেক্ট ফেরত দেয় যাতে পোস্ট অ্যারে থাকে
        if (res.data && res.data.data) {
          setPosts(res.data.data); // সাধারণ API প্রতিক্রিয়া অনুযায়ী res.data.data তে আপডেট করুন
        } else {
          setPosts(res.data.posts || []); // ডেটা উপস্থিত না থাকলে সরাসরি পোস্টগুলিতে ফলব্যাক করুন
        }
      } catch (err) {
        console.error('পোস্ট ফেচ করতে ব্যর্থ হয়েছে', err);
        // ব্যবহারকারীর জন্য ত্রুটি বার্তা হ্যান্ডেল করুন
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [token]); // টোকেন পরিবর্তন হলে আবার ফেচ করুন

  // ফাইল নির্বাচন এবং তাৎক্ষণিক আপলোড পরিচালনা করুন
  const handleFileSelectAndUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploadingIndividualImage(true); // একটি করে ছবি আপলোডের লোডিং শুরু করুন
    setPostCreationMessage(''); // পূর্ববর্তী বার্তা পরিষ্কার করুন

    const newUploadedUrls = []; // এই ব্যাচের আপলোডের জন্য URL গুলো সাময়িকভাবে ধরে রাখবে

    for (const file of files) {
      const formData = new FormData();
      formData.append('upload', file); // নিশ্চিত করুন যে এটি ব্যাকএন্ডে প্রত্যাশিত ক্ষেত্রের নামের সাথে মেলে

      try {
        const uploadRes = await axios.post(
          `${API_BASE_URL}/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          }
        );

        let uploadedUrl = '';
        // একক ফাইল আপলোডের জন্য সাধারণ ব্যাকএন্ড প্রতিক্রিয়া অনুযায়ী সামঞ্জস্য করুন
        if (uploadRes.data && uploadRes.data.data && uploadRes.data.data.url) {
          uploadedUrl = uploadRes.data.data.url;
        } else if (uploadRes.data && uploadRes.data.url) {
          uploadedUrl = uploadRes.data.url;
        } else if (uploadRes.data && uploadRes.data.data && Array.isArray(uploadRes.data.data.imageUrls) && uploadRes.data.data.imageUrls.length > 0) {
          uploadedUrl = uploadRes.data.data.imageUrls[0];
        } else if (uploadRes.data && Array.isArray(uploadRes.data.imageUrls) && uploadRes.data.imageUrls.length > 0) {
          uploadedUrl = uploadRes.data.imageUrls[0];
        }

        if (uploadedUrl) {
          newUploadedUrls.push(uploadedUrl);
        } else {
          console.error('ফাইল আপলোডের প্রতিক্রিয়ায় URL পাওয়া যায়নি:', file.name, uploadRes.data);
          setPostCreationMessage(`ত্রুটি: ${file.name} আপলোড করা যায়নি: URL পাওয়া যায়নি।`);
          setPostCreationMessageType('error');
        }
      } catch (err) {
        console.error('একক ছবি আপলোড করতে ত্রুটি:', file.name, err);
        const errorMessage = err.response?.data?.message || err.message;
        setPostCreationMessage(`ত্রুটি: ${file.name} আপলোড করতে ব্যর্থ: ${errorMessage}`);
        setPostCreationMessageType('error');
      }
    }

    // ব্যাচের সমস্ত ফাইল প্রক্রিয়া করার পরে প্রধান uploadedImageUrls স্টেট আপডেট করুন
    setUploadedImageUrls((prevUrls) => [...prevUrls, ...newUploadedUrls]);
    setIsUploadingIndividualImage(false); // একটি করে ছবি আপলোডের লোডিং শেষ করুন
    e.target.value = null; // ফাইল ইনপুট ফিল্ড পরিষ্কার করুন যাতে একই ফাইল আবার নির্বাচন করা যায়
  };

  // একটি আপলোড করা ছবি তার URL দ্বারা সরান
  const removeUploadedImage = (urlToRemove) => {
    setUploadedImageUrls((prevUrls) => prevUrls.filter((url) => url !== urlToRemove));
  };

  // নতুন পোস্ট জমা দেওয়া হ্যান্ডেল করুন
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostCreationMessage('');
    if (!content.trim() && uploadedImageUrls.length === 0) { // uploadedImageUrls চেক করুন
      setPostCreationMessage('পোস্টের বিষয়বস্তু বা ছবি প্রয়োজন।');
      setPostCreationMessageType('error');
      return;
    }
    if (!token) {
      setPostCreationMessage('ব্যবহারকারী প্রমাণীকৃত নয়। পোস্ট তৈরি করতে লগইন করুন।');
      setPostCreationMessageType('error');
      return;
    }

    setPostCreationLoading(true);

    try {
      const postRes = await axios.post(
        `${API_BASE_URL}/posts`,
        {
          content,
          imageUrl: uploadedImageUrls, // ইতিমধ্যে আপলোড করা URL গুলি ব্যবহার করুন
          authorId: currentUserId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      );

      if (postRes.data && postRes.data.data) {
        setPosts([postRes.data.data, ...posts]);
        setPostCreationMessage('পোস্ট সফলভাবে তৈরি হয়েছে!');
        setPostCreationMessageType('success');
      } else {
        setPosts([postRes.data.post, ...posts]);
        setPostCreationMessage('পোস্ট সফলভাবে তৈরি হয়েছে!');
        setPostCreationMessageType('success');
      }

      setContent('');
      setUploadedImageUrls([]); // পোস্ট করার পর আপলোড করা ছবিগুলি পরিষ্কার করুন
    } catch (err) {
      console.error('পোস্ট তৈরি করতে ব্যর্থ হয়েছে', err);
      const errorMessage = err.response?.data?.message || err.message;
      setPostCreationMessage(`পোস্ট তৈরি করতে ব্যর্থ: ${errorMessage}`);
      setPostCreationMessageType('error');
    } finally {
      setPostCreationLoading(false);
    }
  };

  // যখন একটি পোস্ট ডিলিট করা হয়, তখন পোস্ট তালিকা থেকে সরিয়ে দিন
  const handlePostDeleted = (deletedPostId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => (post.id || post._id) !== deletedPostId));
  };

  // যখন একটি পোস্ট আপডেট করা হয় (এটি বর্তমানে Home কম্পোনেন্টের জন্য প্রয়োজন নেই, কারণ Post কম্পোনেন্ট নিজেই স্টেট আপডেট করে)
  const handlePostUpdated = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        (post.id || post._id) === (updatedPost.id || updatedPost._id) ? updatedPost : post
      )
    );
  };


  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        padding: '20px',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '600px', padding: '10px' }}>
        {/* পোস্ট তৈরির ফর্ম */}
        <form
          onSubmit={handlePostSubmit}
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <textarea
            placeholder="আপনার মনে কি আছে?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #dddfe2',
              outline: 'none',
              fontSize: '16px',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          {uploadedImageUrls.length > 0 && ( // আপলোড করা ছবিগুলি প্রদর্শন করুন
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              {uploadedImageUrls.map((imgUrl, idx) => (
                <div
                  key={imgUrl} // URL কে কী হিসাবে ব্যবহার করুন
                  style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}
                >
                  <img
                    src={imgUrl}
                    alt={`পূর্বরূপ -${idx}`} // বাংলা alt টেক্সট
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/100x100/CCCCCC/000000?text=ত্রুটি`; // বাংলা ফলব্যাক টেক্সট
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(imgUrl)} // নতুন remove ফাংশন কল করুন
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#ff4d4f',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      width: '22px',
                      height: '22px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      lineHeight: '20px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {/* একক ছবি আপলোডের লোডিং সূচক */}
              {isUploadingIndividualImage && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100px', height: '100px', borderRadius: '8px',
                    backgroundColor: '#f0f2f5', border: '1px dashed #ccc'
                }}>
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
              )}
            </div>
          )}

          <label
            htmlFor="file-upload"
            style={{
              cursor: 'pointer',
              color: '#1877f2',
              fontWeight: '600',
              fontSize: '14px',
              display: 'inline-block',
              marginTop: '10px',
            }}
          >
            + ছবি যোগ করুন (গুলি)
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelectAndUpload} // নতুন হ্যান্ডলার ফাংশন ব্যবহার করুন
            style={{ display: 'none' }}
          />

          {/* পোস্ট তৈরির বার্তা প্রদর্শন */}
          {postCreationMessage && (
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center',
                backgroundColor: postCreationMessageType === 'success' ? '#d4edda' : '#f8d7da',
                color: postCreationMessageType === 'success' ? '#155724' : '#721c24',
                marginBottom: '10px',
              }}
            >
              {postCreationMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={(!content.trim() && uploadedImageUrls.length === 0) || postCreationLoading || isUploadingIndividualImage} // আপলোড চলাকালীনও নিষ্ক্রিয় করুন
            style={{
              backgroundColor: '#1877f2',
              color: 'white',
              fontWeight: '600',
              padding: '12px',
              borderRadius: '25px',
              border: 'none',
              cursor:
                ((!content.trim() && uploadedImageUrls.length === 0) || postCreationLoading || isUploadingIndividualImage) ? 'not-allowed' : 'pointer',
              opacity: ((!content.trim() && uploadedImageUrls.length === 0) || postCreationLoading || isUploadingIndividualImage) ? 0.6 : 1,
              transition: 'opacity 0.3s',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {postCreationLoading ? (
                <svg
                    className="animate-spin"
                    style={{ width: '20px', height: '20px', color: 'white' }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
            ) : (
                'পোস্ট করুন'
            )}
          </button>
        </form>

        {/* সব পোস্ট দেখান */}
        {loadingPosts ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#555' }}>
            পোস্ট লোড হচ্ছে...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', color: '#65676b' }}>
            এখনও কোনো পোস্ট নেই। একটি নতুন পোস্ট তৈরি করুন!
          </div>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id || post._id} // কী হিসাবে post.id বা post._id ব্যবহার করুন
              postId={post.id || post._id}
              currentUserId={currentUserId}
              token={token}
              onPostDeleted={handlePostDeleted} // ডিলিট হ্যান্ডলার পাস করুন
              onPostUpdated={handlePostUpdated} // আপডেট হ্যান্ডলার পাস করুন
            />
          ))
        )}
      </div>
    </div>
  );
};

// Home কম্পোনেন্ট রেন্ডার করার জন্য প্রধান অ্যাপ কম্পোনেন্ট
const App = () => {
  return (
    <div className="App">
      <Home />
    </div>
  );
};

export default App;
