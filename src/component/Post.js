import React, { useState, useEffect } from "react";

// IMPORTANT: Ensure this API_BASE_URL matches your backend's base URL.
const API_BASE_URL = "/api/v1";

const Post = ({ postId, currentUserId }) => {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!postId) {
        setError("Error: Post ID is missing. Cannot load post.");
        setLoading(false);
        console.error(
          "Post ID is undefined. Please ensure a valid postId is passed to the Post component."
        );
        return;
      }

      if (!currentUserId) {
        console.warn(
          "Current user ID is missing. Some features (like, comment) might not work correctly."
        );
      }

      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/posts/${postId}`;
        console.log("Attempting to fetch post from:", url);

        const postResponse = await fetch(url);

        if (!postResponse.ok) {
          console.error(
            `Fetch error: Status ${postResponse.status}, Text: ${postResponse.statusText}`
          );
          throw new Error(
            `Failed to fetch post: ${postResponse.status} - ${postResponse.statusText}`
          );
        }
        const postResult = await postResponse.json();
        console.log("Fetched post data:", postResult);

        if (postResult && postResult.data) {
          setPostData(postResult.data);

          const userLikedThisPost = postResult.data.likes.some(
            (like) => like.authorId === currentUserId
          );
          setLiked(userLikedThisPost);
          setLikeCount(postResult.data.likes.length);

          setComments(postResult.data.comments);
        } else {
          console.error(
            "Fetched data structure is not as expected:",
            postResult
          );
          throw new Error("Invalid data structure received for post.");
        }
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError(
          `Failed to load post: ${err.message}. আরও বিশদ বিবরণের জন্য কনসোল পরীক্ষা করুন।`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId, currentUserId]);

  const toggleLike = async () => {
    if (!currentUserId) {
      console.warn("User not authenticated. Cannot like/unlike.");
      setError("Error: User not authenticated to like/unlike.");
      return;
    }
    if (!postId) {
      console.warn("Post ID is missing. Cannot toggle like.");
      setError("Error: Cannot toggle like, Post ID is missing.");
      return;
    }

    try {
      let response;
      const headers = {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"), // আপনার অথেন্টিকেশন টোকেন যোগ করুন
      };

      if (liked) {
        response = await fetch(`${API_BASE_URL}/likes`, {
          method: "DELETE",
          headers: headers,
          body: JSON.stringify({ postId }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/likes`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ postId }),
        });
      }

      if (!response.ok) {
        if (response.status === 409 && !liked) {
          console.warn("You have already liked this post.");
          setLiked(true);
          return;
        }
        const errorBody = await response.text();
        throw new Error(
          `Failed to toggle like: ${response.status} - ${response.statusText}. Body: ${errorBody}`
        );
      }

      setLiked(!liked);
      setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(`Failed to process like: ${err.message}`);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (commentInput.trim() === "") return;

    if (!currentUserId) {
      console.warn("User not authenticated. Cannot comment.");
      setError("Error: User not authenticated to comment.");
      return;
    }
    if (!postId) {
      console.warn("Post ID is missing. Cannot submit comment.");
      setError("Error: Cannot submit comment, Post ID is missing.");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"), // আপনার অথেন্টিকেশন টোকেন যোগ করুন
      };

      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          postId: postId,
          content: commentInput.trim(),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to submit comment: ${response.status} - ${response.statusText}. Body: ${errorBody}`
        );
      }

      const newCommentResult = await response.json();
      console.log("New comment received:", newCommentResult.data);

      setComments((prevComments) => [...prevComments, newCommentResult.data]);
      setCommentInput("");
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError(`Failed to submit comment: ${err.message}`);
    }
  };

  const handleShare = () => {
    console.log("Post shared!");
  };

  if (loading) {
    return (
      <div
        style={{ textAlign: "center", padding: "20px", fontSize: "16px", color: "#555" }}
      >
        পোস্ট লোড হচ্ছে...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ textAlign: "center", color: "red", padding: "20px", fontSize: "16px" }}
      >
        ত্রুটি: {error}
      </div>
    );
  }

  if (!postData) {
    return (
      <div
        style={{ textAlign: "center", padding: "20px", fontSize: "16px", color: "#555" }}
      >
        পোস্ট পাওয়া যায়নি। নিশ্চিত করুন যে postId সঠিক।
      </div>
    );
  }

  const { title, content, imageUrl, author, createdAt } = postData;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
        maxWidth: "600px",
        marginLeft: "auto",
        marginRight: "auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Post Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <img
          src={author?.profileImage || "https://placehold.co/48x48/CCCCCC/000000?text=User"}
          alt={author?.firstName || "User"}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "12px",
          }}
        />
        <div>
          <div style={{ fontWeight: "600", fontSize: "16px", color: "#050505" }}>
            {author?.firstName} {author?.lastName}
          </div>
          <div style={{ fontSize: "12px", color: "#65676b" }}>
            {new Date(createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Post Title */}
      {title && (
        <div style={{ fontWeight: "bold", fontSize: "18px", color: "#050505", marginBottom: "8px" }}>
          {title}
        </div>
      )}

      {/* Post Content */}
      {content && (
        <div style={{ fontSize: "15px", color: "#050505", marginBottom: imageUrl ? "12px" : "0" }}>
          {content}
        </div>
      )}

      {/* Post Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post"
          style={{
            width: "100%",
            borderRadius: "8px",
            maxHeight: "400px",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x300/CCCCCC/000000?text=No+Image";
          }}
        />
      )}

      {/* Post Actions (like, comment, share) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "12px",
          borderTop: "1px solid #dddfe2",
          paddingTop: "8px",
          color: liked ? "#1877f2" : "#65676b",
          fontWeight: "600",
          fontSize: "14px",
          userSelect: "none",
        }}
      >
        <button
          onClick={toggleLike}
          style={{
            cursor: "pointer",
            border: "none",
            background: "transparent",
            color: liked ? "#1877f2" : "#65676b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          👍 Like {likeCount > 0 && `(${likeCount})`}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            cursor: "pointer",
            border: "none",
            background: "transparent",
            color: "#65676b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          💬 Comment {comments.length > 0 && `(${comments.length})`}
        </button>
        <button
          onClick={handleShare}
          style={{
            cursor: "pointer",
            border: "none",
            background: "transparent",
            color: "#65676b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ↗ Share
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div style={{ marginTop: "12px" }}>
          <form onSubmit={submitComment} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="একটি কমেন্ট লিখুন..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              style={{
                flexGrow: 1,
                padding: "8px 12px",
                borderRadius: "20px",
                border: "1px solid #dddfe2",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#1877f2",
                color: "#fff",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              পোস্ট করুন
            </button>
          </form>

          {/* Comments List */}
          <div style={{ marginTop: "12px" }}>
            {comments.length === 0 ? (
              <div style={{ color: "#65676b", fontStyle: "italic" }}>এখনও কোনো কমেন্ট নেই।</div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    backgroundColor: "#f0f2f5",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#050505",
                  }}
                >
                  <div style={{ fontWeight: "600", fontSize: "13px", color: "#333" }}>
                    {comment.author?.firstName} {comment.author?.lastName}
                    <span style={{ fontSize: "11px", color: "#65676b", marginLeft: "8px" }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {comment.content}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;