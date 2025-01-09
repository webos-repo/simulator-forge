import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="flex justify-center space-x-4 mb-8">
        <a
          href="https://vite.dev"
          target="_blank"
          className="text-blue-600 hover:text-blue-800"
        >
          aaa
        </a>
        <a
          href="https://react.dev"
          target="_blank"
          className="text-blue-600 hover:text-blue-800"
        >
          bbb
        </a>
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">Vite + React</h1>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-600 text-center">
          Edit <code className="bg-gray-100 px-1 rounded">src/App.tsx</code> and
          save to test HMR
        </p>
      </div>
      <p className="text-center text-gray-500 mt-8">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
