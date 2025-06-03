// src/pages/Home.js
import React, { useState } from "react";
import Post from "../component/Post";

const Home = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "John Doe",
      userImage: "https://randomuser.me/api/portraits/men/32.jpg",
      time: "2 hrs ago",
      content: "Had a great day at the beach! 🌊🏖️",
      postImages: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      id: 2,
      userName: "Jane Smith",
      userImage: "https://randomuser.me/api/portraits/women/44.jpg",
      time: "5 hrs ago",
      content: "Just cooked a delicious meal! 🍝 #foodie",
      postImages: [],
    },
    {
      id: 3,
      userName: "Alex Johnson",
      userImage: "https://randomuser.me/api/portraits/men/75.jpg",
      time: "1 day ago",
      content: "Loving the new React 18 features!",
      postImages: [
        "https://miro.medium.com/max/1400/1*bL6WuzMj9cZ_rkj0io9sKA.png",
      ],
    },
  ]);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages(urls);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    const newPost = {
      id: Date.now(),
      userName: "Current User",
      userImage: "https://randomuser.me/api/portraits/men/99.jpg",
      time: "Just now",
      content: content.trim(),
      postImages: images,
    };

    setPosts([newPost, ...posts]);
    setContent("");
    setImages([]);
    e.target.reset();
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "10px",
        }}
      >
        <form
          onSubmit={handlePostSubmit}
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "16px",
            boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #dddfe2",
              outline: "none",
              fontSize: "16px",
              minHeight: "100px",
              resize: "vertical",
              fontFamily: "inherit",
              textAlign: "left",
              verticalAlign: "top",
            }}
          />

          {images.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {images.map((imgSrc, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "100px",
                    height: "100px",
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={`preview-${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                      boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      backgroundColor: "#ff4d4f",
                      border: "none",
                      borderRadius: "50%",
                      color: "white",
                      width: "22px",
                      height: "22px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      lineHeight: "20px",
                      padding: 0,
                    }}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            htmlFor="file-upload"
            style={{
              cursor: "pointer",
              color: "#1877f2",
              fontWeight: "600",
              fontSize: "14px",
              display: "inline-block",
            }}
          >
            + Add Photo(s)
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          <button
            type="submit"
            disabled={!content.trim() && images.length === 0}
            style={{
              backgroundColor: "#1877f2",
              color: "white",
              fontWeight: "600",
              padding: "12px",
              borderRadius: "25px",
              border: "none",
              cursor:
                !content.trim() && images.length === 0 ? "not-allowed" : "pointer",
              opacity: !content.trim() && images.length === 0 ? 0.6 : 1,
              transition: "opacity 0.3s",
              width: "100%",
            }}
          >
            Post
          </button>
        </form>

        {/* Posts List */}
        {posts.map((post) => (
          <Post
            key={post.id}
            userName={post.userName}
            userImage={post.userImage}
            time={post.time}
            content={post.content}
            postImage={post.postImages[0]}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
