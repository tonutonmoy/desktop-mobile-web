function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', color: '#333' }}>🏠 Home Page</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>
        আমি এখন একই কোডে Web, Desktop এবং Mobile এ কাজ করছি!
      </p>

      <div style={{ marginTop: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '10px' }}>
        <h2 style={{ color: '#2c3e50' }}>🔧 Features:</h2>
        <ul style={{ lineHeight: '1.8', color: '#444' }}>
          <li>✅ এক্সপ্রেসিভ ইউআই ডিজাইন</li>
          <li>✅ Web, Desktop (Electron), এবং Mobile (React Native) সাপোর্ট</li>
          <li>✅ কোড রিইউজ এবং অপটিমাইজেশন</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p style={{ fontStyle: 'italic', color: '#888' }}>
          এই প্রজেক্টটি রিয়েল টাইম ব্যবহারকারীদের অভিজ্ঞতা উন্নত করার জন্য ডিজাইন করা হয়েছে।
        </p>
      </div>
    </div>
  );
}

export default Home;
