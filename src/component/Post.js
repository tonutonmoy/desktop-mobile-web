import React, { useState } from "react";

const Post = ({ userName, userImage, time, content, postImage }) => {
  // Like state & count
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Comment state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  // Handle Like click
  const toggleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  // Handle comment submit
  const submitComment = (e) => {
    e.preventDefault();
    if (commentInput.trim() === "") return;

    setComments([...comments, commentInput.trim()]);
    setCommentInput("");
  };

  // Handle share (simple alert)
  const handleShare = () => {
    alert("Post shared!");
  };

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
      }}
    >
      {/* Post Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <img
          src={userImage}
          alt={userName}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "12px",
          }}
        />
        <div>
          <div style={{ fontWeight: "600", fontSize: "16px", color: "#050505" }}>{userName}</div>
          <div style={{ fontSize: "12px", color: "#65676b" }}>{time}</div>
        </div>
      </div>

      {/* Post Content */}
      <div style={{ fontSize: "15px", color: "#050505", marginBottom: postImage ? "12px" : "0" }}>
        {content}
      </div>

      {/* Post Image */}
      {postImage && (
        <img
          src={postImage}
          alt="Post"
          style={{
            width: "100%",
            borderRadius: "8px",
            maxHeight: "400px",
            objectFit: "cover",
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
              placeholder="Write a comment..."
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
              Post
            </button>
          </form>

          {/* Comments List */}
          <div style={{ marginTop: "12px" }}>
            {comments.length === 0 ? (
              <div style={{ color: "#65676b", fontStyle: "italic" }}>No comments yet.</div>
            ) : (
              comments.map((comment, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#f0f2f5",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#050505",
                  }}
                >
                  {comment}
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
