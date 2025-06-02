function About() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>ℹ️ About Page</h1>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
        এই অ্যাপটি React দিয়ে বানানো হয়েছে এবং Web, Desktop (Electron), ও Mobile (React Native) সব জায়গায় সমানভাবে চলে!
      </p>

      <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '8px' }}>🚀 Main Features:</h2>
        <ul style={{ paddingLeft: '20px', color: '#444', lineHeight: '1.8' }}>
          <li>অ্যাপের UI সম্পূর্ণ Responsive ও Modern ডিজাইন</li>
          <li>একটি কোডবেস থেকে Web, Desktop, Mobile সমস্ত প্ল্যাটফর্মে সাপোর্ট</li>
          <li>Inline styling ব্যবহার করে কাস্টমাইজ করা সহজ</li>
          <li>তিন-স্তরের রাউটিং (Home, About, Contact) ব্যবস্থা</li>
          <li>বাংলা ও ইংরেজি উভয় ভাষা সাপোর্ট</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '8px' }}>👥 Team Information:</h2>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
          <strong>Developer:</strong> তনু তন্ময় (Full-Stack Developer)<br />
          <strong>Design Lead:</strong> সানো (UI/UX Designer)<br />
          <strong>সাপোর্ট टीम:</strong> রিয়া, হাসান, আরিফ
        </p>
      </div>

      <div style={{ marginTop: '20px', backgroundColor: '#eef7ff', padding: '15px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '8px' }}>📞 Contact & Feedback:</h2>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
          কোনো প্রশ্ন বা ফিডব্যাক আছে? নিচের ঠিকানায় মেইল পাঠাবেন:<br />
          <a
            href="mailto:support@example.com"
            style={{ color: '#1a73e8', textDecoration: 'none' }}
          >
            support@example.com
          </a>
        </p>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
        <p>© ২০২৫ FLIND. সর্বস্বত্ব সংরক্ষিত।</p>
      </div>
    </div>
  );
}

export default About;
