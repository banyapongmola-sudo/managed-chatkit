import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Paperclip, X } from 'lucide-react'; // ลงเพิ่ม: npm install lucide-react

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // --- ระบบ Voice to Text (Speech Recognition) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH'; // ตั้งเป็นภาษาไทย
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // เมื่อพูดจบ ให้ส่งค่าไปที่ sendMessage ทันทีตามที่คุณต้องการ
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  // --- ระบบส่งข้อความและไฟล์ ---
  const handleSendMessage = async (text = inputText) => {
    if (!text && !selectedFile) return;

    // จำลองการเพิ่มข้อความฝั่ง User เข้าไปใน UI ก่อน
    const newMessage = { role: 'user', content: text, file: selectedFile?.name };
    setMessages([...messages, newMessage]);

    // TODO: ส่งค่าไปยัง Backend (FastAPI) ของคุณ
    // const formData = new FormData();
    // formData.append('text', text);
    // if (selectedFile) formData.append('file', selectedFile);
    // await fetch('/api/chat', { method: 'POST', body: formData });

    setInputText('');
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border shadow-xl bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b font-bold text-center text-gray-700">
        ChatKit Assistant
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'
            }`}>
              {msg.content}
              {msg.file && (
                <div className="mt-2 text-xs italic opacity-80 border-t pt-1">
                  📎 {msg.file}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {/* File Preview */}
        {selectedFile && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg text-sm">
            <Paperclip size={14} />
            <span className="truncate">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)}><X size={14} /></button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <button 
            onClick={startListening}
            className={`p-2 rounded-full transition-colors ${
              isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Mic size={20} />
          </button>

          <button 
            onClick={() => handleSendMessage()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;