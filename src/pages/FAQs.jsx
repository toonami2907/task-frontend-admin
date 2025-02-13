import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import api from '@/functions/resources/axiosConfig'

const FAQs = () => {
  const [faqs, setFaqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [displayCount, setDisplayCount] = useState(5)

  const fetchFAQs = async () => {
    try {
      const response = await api.get('/api/faq')
      setFaqs(response.data.data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFAQs()
  }, [])

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'general', label: 'General' },
    { id: 'billing', label: 'Billing' },
    { id: 'technical', label: 'Technical' },
    { id: 'features', label: 'Features' }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gry-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our platform
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.slice(0, displayCount).map((faq) => (
              <div
                key={faq._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  {expandedFaq === faq._id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedFaq === faq._id && (
                  <div className="px-6 py-4 bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                    {faq.media?.url && (
                      <div className="mt-4">
                        {faq.media.type === 'image' ? (
                          <img
                            src={faq.media.url}
                            alt="FAQ illustration"
                            className="rounded-lg max-w-full h-auto"
                          />
                        ) : (
                          <iframe
                            src={faq.media.url}
                            className="w-full aspect-video rounded-lg"
                            allowFullScreen
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredFaqs.length > displayCount && (
              <button
                onClick={() => setDisplayCount(prev => prev + 5)}
                className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <ChevronDown className="h-5 w-5" />
                Show More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FAQs
