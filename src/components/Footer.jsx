import React from "react";


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-6 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Logo + Tên thương hiệu */}
        <div>
          <h2 className="text-2xl font-bold text-white">BAMORA INTERIOR</h2>
          <p className="text-sm mt-2">Tinh tế từng chi tiết, đẳng cấp từng không gian.</p>
        </div>

        
      </div>

      {/* Đường kẻ & bản quyền */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} BAMORA INTERIOR. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;