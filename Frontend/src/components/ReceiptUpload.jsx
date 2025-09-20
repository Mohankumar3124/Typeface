import { useState } from 'react';
import { receiptsService } from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const ReceiptUpload = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError('');
        setTestResult(null);
        setUploadResult(null);
      } else {
        setError('Please select a PDF or image file (JPG, PNG, GIF, WebP)');
        setFile(null);
      }
    }
  };

  const handleTestReceipt = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const result = await receiptsService.testPdfParsing(file);
      setTestResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to test PDF');
      setTestResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const result = await receiptsService.uploadReceipt(file);
      setUploadResult(result);
      
      // Call the success callback to refresh transactions
      if (onUploadSuccess) {
        onUploadSuccess(result.transactions);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload receipt');
      setUploadResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setTestResult(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Receipt
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">Upload Successful!</span>
              </div>
              <p className="text-green-600 text-sm mb-3">{uploadResult.message}</p>
              
              {uploadResult.transactions && uploadResult.transactions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">
                    Imported Transactions:
                  </p>
                  <div className="space-y-2">
                    {uploadResult.transactions.map((transaction, index) => (
                      <div key={index} className="bg-white p-2 rounded border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {transaction.category}
                          </span>
                          <span className={`text-sm font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleReset}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Upload Another
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-yellow-700 font-medium">PDF Test Results</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">
                    Extracted Text (first 500 chars):
                  </p>
                  <pre className="text-xs bg-white p-2 rounded border border-yellow-200 overflow-x-auto max-h-32 overflow-y-auto">
                    {testResult.extractedText}
                  </pre>
                </div>
                
                {testResult.textLines && (
                  <div>
                    <p className="text-sm font-medium text-yellow-700 mb-1">
                      Text Lines ({testResult.textLines.length} lines):
                    </p>
                    <div className="text-xs bg-white p-2 rounded border border-yellow-200 max-h-40 overflow-y-auto">
                      {testResult.textLines.map((line, index) => (
                        <div key={index} className="flex">
                          <span className="text-gray-400 w-8">{line.lineNumber}:</span>
                          <span className="ml-2">{line.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => setTestResult(null)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Clear Test Results
                </button>
              </div>
            </div>
          )}

          {/* Upload Form */}
          {!uploadResult && (
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Receipt (PDF or Image)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <div className="space-y-2">
                    <label className="cursor-pointer">
                      <span className="text-blue-500 hover:text-blue-600 font-medium">
                        Choose receipt file
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500">
                      Upload a PDF or image receipt (POS receipts, invoices, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected File Info */}
              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-blue-700 text-sm font-medium">
                      {file.name}
                    </span>
                  </div>
                  <p className="text-blue-600 text-xs mt-1">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Supported Formats:
                </h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>PDF files:</strong> Transaction tables, invoices</li>
                  <li>• <strong>Image files:</strong> POS receipts, photos of bills (JPG, PNG, GIF, WebP)</li>
                  <li>• Should contain amounts in Indian Rupees (₹)</li>
                  <li>• Clear, readable text for better OCR results</li>
                  <li>• Maximum file size: 5MB</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleTestReceipt}
                  disabled={!file || uploading}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Test Parse</span>
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="spinner !w-4 !h-4 !border-2"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload & Process</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;
