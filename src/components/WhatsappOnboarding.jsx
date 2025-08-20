import React from 'react';
import { FaInfoCircle, FaLightbulb } from 'react-icons/fa';

const WhatsappOnboarding = () => {
  return (
    <div className="bg-slate-800 text-slate-200 p-6 rounded-lg shadow-lg max-w-sm w-full">
      <div className="flex items-center mb-4">
        <FaInfoCircle className="text-blue-400 mr-3 text-xl" />
        <h3 className="font-bold text-lg text-white">First time?</h3>
      </div>
      <p className="mb-3 text-slate-300">To join our WhatsApp bot:</p>
      
      <ol className="list-decimal list-inside space-y-3 text-slate-300">
        <li>Click the "Get Started" button next to this guide.</li>
        <li>
          Send exactly:{" "}
          <code className="bg-green-900 text-green-200 font-mono px-2 py-1 rounded-md">
            join sad-gravity
          </code>
        </li>
        <li>Wait for the confirmation message from Twilio.</li>
        <li>
          Then, send the message{" "}
          <code className="bg-gray-600 text-gray-200 font-mono px-2 py-1 rounded-md">
            lessgo!
          </code>{" "}
          to see the command list.
        </li>
        <li>
          Start tracking:{" "}
          <code className="bg-gray-600 text-gray-200 font-mono px-2 py-1 rounded-md">
            spent 500 on coffee
          </code>
        </li>
      </ol>
      
      <hr className="border-slate-600 my-4" />
      
      <div className="flex items-center text-slate-400">
        <FaLightbulb className="text-yellow-400 mr-3" />
        <p className="text-sm">After joining, the "lessgo!" message activates the bot.</p>
      </div>
    </div>
  );
};

export default WhatsappOnboarding;