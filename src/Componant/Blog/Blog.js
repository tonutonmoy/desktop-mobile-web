// src/pages/Blog.js
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: '1',
    title: 'React Blog শুরু করা',
    date: '২০২৫-০৬-০২',
    preview: 'এই পোস্টে আমরা শিখবো কিভাবে React দিয়ে একটি সহজ ব্লগ অ্যাপ তৈরি করা যায়।',
  },
  {
    id: '2',
    title: 'Routing Explained',
    date: '২০২৫-০৬-০১',
    preview: 'React Router ব্যবহার করে পেইজ পরিবর্তন কিভাবে হয় তা বিস্তারিত বলা হয়েছে।',
  },
];

const styles = {
  container: {
    padding: '30px',
    maxWidth: '800px',
    margin: 'auto',
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: '2rem',
    textAlign: 'center',
    marginBottom: '30px',
  },
  postCard: {
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  date: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '10px',
  },
  preview: {
    fontSize: '1rem',
    color: '#555',
  },
};

function Blog() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📚 আমাদের ব্লগ</h1>
      {blogPosts.map((post) => (
        <Link to={`/blog/${post.id}`} key={post.id} style={styles.postCard}>
          <h2 style={styles.title}>{post.title}</h2>
          <p style={styles.date}>🗓️ {post.date}</p>
          <p style={styles.preview}>{post.preview}</p>
        </Link>
      ))}
    </div>
  );
}

export default Blog;
