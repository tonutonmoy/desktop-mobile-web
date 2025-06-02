// src/pages/BlogDetails.js
import { useParams } from 'react-router-dom';

const dummyPosts = {
  '1': {
    title: 'React Blog শুরু করা',
    content: 'এই পোস্টে আমরা শিখবো কিভাবে React দিয়ে একটি সহজ ব্লগ অ্যাপ তৈরি করা যায়।',
  },
  '2': {
    title: 'Routing Explained',
    content: 'React Router ব্যবহার করে আমরা কিভাবে পেইজ পরিবর্তন করতে পারি তা দেখানো হয়েছে।',
  },
};

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '800px',
    margin: 'auto',
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: '#fefefe',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  content: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#34495e',
  },
  notFound: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#e74c3c',
    marginTop: '50px',
  },
};

function BlogDetails() {
  const { id } = useParams();
  const post = dummyPosts[id];

  if (!post) {
    return <h2 style={styles.notFound}>❌ পোস্ট খুঁজে পাওয়া যায়নি</h2>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{post.title}</h1>
      <p style={styles.content}>{post.content}</p>
    </div>
  );
}

export default BlogDetails;
