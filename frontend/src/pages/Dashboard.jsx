import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Copy, Check, ExternalLink, Trash2, Globe, BarChart2, Plus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchUrls = useCallback(async (targetPage = 0) => {
    setFetchLoading(true);
    try {
      const response = await api.get(`/urls?page=${targetPage}&size=${pageSize}&sort=createdAt,desc`);
      setUrls(response.data.content);
      setPage(response.data.pageNumber);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error('Failed to load URLs', err);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls(page);
  }, [fetchUrls, page]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/urls', {
        originalUrl,
        customAlias: customAlias.trim() ? customAlias.trim() : null,
      });
      setOriginalUrl('');
      setCustomAlias('');
      fetchUrls(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL. Verify alias uniqueness or format.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shortened link?')) return;
    try {
      await api.delete(`/urls/${id}`);
      fetchUrls(page);
    } catch (err) {
      alert('Failed to delete URL');
    }
  };

  const copyToClipboard = (text, code) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalClicks = urls.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Short Links</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalElements}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Globe className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Page Click Total</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalClicks}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Rate Limit</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">30 req/min</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Creation Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Shorten a New Link</h2>
        
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleShorten} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7">
            <input
              type="url"
              required
              placeholder="Paste long URL (e.g., https://example.com/very/long/path)..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Custom alias (optional)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Shortening...' : 'Shorten'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Paginated URLs Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Your Shortened Links</h3>
          <span className="text-xs text-slate-500 font-medium">{totalElements} Total Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Short Link</th>
                <th className="px-6 py-3.5">Original URL</th>
                <th className="px-6 py-3.5 text-center">Clicks</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {fetchLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading links...</td>
                </tr>
              ) : urls.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No URLs shortened yet. Create one above!</td>
                </tr>
              ) : (
                urls.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-600 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <a
                          href={item.fullShortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>{item.shortCode}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                        <button
                          onClick={() => copyToClipboard(item.fullShortUrl, item.shortCode)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          title="Copy link"
                        >
                          {copiedCode === item.shortCode ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={item.originalUrl}>
                      {item.originalUrl}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {item.clickCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete URL"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};