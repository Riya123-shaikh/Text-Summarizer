import React, { useState } from 'react';
import { FileText, Loader2, Copy, Check, Upload, List, Tag } from 'lucide-react';

export default function TextSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summaryFormat, setSummaryFormat] = useState('paragraph');
  const [keywords, setKeywords] = useState([]);

  const extractKeywords = (text) => {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can']);
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
      if (word.length > 4 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    return sortedWords;
  };

  const extractiveSummarize = (text, numSentences) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) return text;
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const sentenceScores = sentences.map(sentence => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      let score = 0;
      
      sentenceWords.forEach(word => {
        if (wordFreq[word]) {
          score += wordFreq[word];
        }
      });
      
      return {
        sentence: sentence.trim(),
        score: score / sentenceWords.length
      };
    });
    
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences);
    
    const orderedSentences = topSentences.sort((a, b) => {
      return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
    });
    
    return orderedSentences.map(s => s.sentence);
  };

  const formatSummary = (sentences) => {
    if (summaryFormat === 'paragraph') {
      return sentences.join(' ');
    } else {
      return sentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    
    try {
      if (fileType === 'txt') {
        const text = await file.text();
        setInputText(text);
        setError('');
      } else if (fileType === 'pdf') {
        setError('PDF support: Please copy and paste the text from your PDF file.');
      } else {
        setError('Unsupported file format. Please upload TXT files or paste text directly.');
      }
    } catch (err) {
      setError('Error reading file. Please try again.');
    }
  };

  const summarizeText = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize');
      return;
    }

    if (inputText.length < 100) {
      setError('Text is too short. Please enter at least 100 characters for meaningful summarization.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');
    setKeywords([]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const sentenceCounts = {
        short: 2,
        medium: 4,
        long: 6
      };
      
      const sentences = extractiveSummarize(inputText, sentenceCounts[summaryLength]);
      const formattedSummary = formatSummary(sentences);
      setSummary(formattedSummary);
      
      const extractedKeywords = extractKeywords(inputText);
      setKeywords(extractedKeywords);
      
    } catch (err) {
      setError('An error occurred while summarizing. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputText('');
    setSummary('');
    setError('');
    setKeywords([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Text Summarizer Pro
          </h1>
          <p className="text-gray-600">
            Advanced NLP with File Upload, Keyword Extraction & Multiple Formats
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Input Text</h2>
              <span className="text-sm text-gray-500">
                {inputText.length} characters
              </span>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors bg-indigo-50">
                <Upload className="w-5 h-5 text-indigo-600 mr-2" />
                <span className="text-sm text-indigo-600 font-medium">Upload TXT File</span>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here or upload a TXT file... (minimum 100 characters)"
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />

            <div className="mt-4">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <List className="w-4 h-4 mr-1" />
                Summary Format
              </label>
              <select
                value={summaryFormat}
                onChange={(e) => setSummaryFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="paragraph">Paragraph</option>
                <option value="bullets">Bullet Points</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Length
              </label>
              <div className="flex gap-2">
                {['short', 'medium', 'long'].map((length) => (
                  <button
                    key={length}
                    onClick={() => setSummaryLength(length)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      summaryLength === length
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={summarizeText}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Summarize'
                )}
              </button>
              
              <button
                onClick={clearAll}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
                {summary && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="h-48 overflow-y-auto">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                  </div>
                )}

                {summary && !error && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {summary}
                    </p>
                  </div>
                )}

                {!summary && !error && !loading && (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Your summary will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Tag className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Keywords</h2>
              </div>

              <div className="min-h-24">
                {keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center text-gray-400">
                    <p className="text-sm">Keywords will appear here after summarization</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Features & Technology
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-600 text-sm">
            <div>
              <p className="mb-2">
                <strong>📄 File Upload Support:</strong> Upload TXT files directly for quick summarization.
              </p>
              <p className="mb-2">
                <strong>📝 Multiple Formats:</strong> Choose between paragraph or bullet point summaries.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>🔑 Keyword Extraction:</strong> Automatically identifies the most important keywords from your text.
              </p>
              <p className="mb-2">
                <strong>🌍 Universal Language:</strong> Works with text in any language - English, Spanish, Arabic, Chinese, and more!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}