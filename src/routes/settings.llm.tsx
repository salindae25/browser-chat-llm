
// Import Tailwind v4 via browser plugin (for example, CDN link)
import { RootRoute, createRoute } from '@tanstack/react-router'
import React, { useState } from 'react'

const SettingsLLM = () => {
  const [apiKeyOpenAI, setApiKeyOpenAI] = useState('')
  const [apiModelOpenAI, setApiModelOpenAI] = useState('gpt-4')

  const [apiKeyGroq, setApiKeyGroq] = useState('')
  const [enableGroq, setEnableGroq] = useState(false)

  const [apiKeyGemini, setApiKeyGemini] = useState('')
  const [apiModelGemini, setApiModelGemini] = useState('gemini-pro')

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    alert("Settings saved successfully!")
    // Here you'd add backend API calls or save to localStorage
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r shadow-sm transition duration-300">
        <h2 className="font-bold text-xl py-6 px-6">LLM Configurator</h2>
        <nav className="flex-grow space-y-4 px-6 py-2">
          <a href="#openai" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-3 font-semibold">
            🧠 OpenAI
          </a>
          <a href="#groq" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-3 font-semibold">
            🔥 Groq
          </a>
          <a href="#gemini" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-3 font-semibold">
            🌈 Gemini
          </a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-grow p-8 max-w-full animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Configure LLM Providers</h1>

        {/* OpenAI Section */}
        <div id="openai" className="mb-6 space-y-4 transition duration-500 rounded-lg shadow p-6 bg-white border">
          <h2 className="font-semibold text-xl flex items-center gap-3 mb-4">OpenAI</h2>
          <label className="flex flex-col sm:flex-row justify-between w-full">
            <div>
              <span className="text-gray-700 font-medium">API Key</span>
              <input
                type="password"
                value={apiKeyOpenAI}
                onChange={(e) => setApiKeyOpenAI(e.target.value)}
                placeholder="Enter your API key..."
                required
                className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
          </label>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div>
              <span className="text-gray-700 font-medium">Model</span>
              <select
                value={apiModelOpenAI}
                onChange={(e) => setApiModelOpenAI(e.target.value)}
                required
                className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
              >
                <option>gpt-4</option>
                <option>gpt-3.5-turbo</option>
                <option>text-davinci-003</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groq Section */}
        <div id="groq" className="mb-6 space-y-4 transition duration-500 rounded-lg shadow p-6 bg-white border">
          <h2 className="font-semibold text-xl flex items-center gap-3 mb-4">Groq</h2>
          <label className="flex flex-col sm:flex-row justify-between w-full">
            <div>
              <span className="text-gray-700 font-medium">API Key</span>
              <input
                type="password"
                value={apiKeyGroq}
                onChange={(e) => setApiKeyGroq(e.target.value)}
                placeholder="Enter your API key..."
                required
                className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
          </label>
          <label className="flex items-center gap-3 mt-4">
            <input type="checkbox" checked={enableGroq} onChange={(e) => setEnableGroq(e.target.checked)} />
            Enable Groq API
          </label>
        </div>

        {/* Gemini Section */}
        <div id="gemini" className="mb-6 space-y-4 transition duration-500 rounded-lg shadow p-6 bg-white border">
          <h2 className="font-semibold text-xl flex items-center gap-3 mb-4">Gemini</h2>
          <label className="flex flex-col sm:flex-row justify-between w-full">
            <div>
              <span className="text-gray-700 font-medium">API Key</span>
              <input
                type="password"
                value={apiKeyGemini}
                onChange={(e) => setApiKeyGemini(e.target.value)}
                placeholder="Enter your API key..."
                required
                className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
          </label>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div>
              <span className="text-gray-700 font-medium">Model</span>
              <select
                value={apiModelGemini}
                onChange={(e) => setApiModelGemini(e.target.value)}
                required
                className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
              >
                <option>gemini-pro</option>
                <option>gemini-beta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" onClick={handleSubmit} className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-200">
          Save Settings
        </button>
      </main>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/settings/llm-providers",
    component: SettingsLLM,
    getParentRoute: () => parentRoute,
  });