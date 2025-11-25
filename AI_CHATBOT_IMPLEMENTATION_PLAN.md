# AI Conversational Assistant Implementation Plan
## Nuk Library Chatbot Replacement

**Date:** November 25, 2025
**Status:** Ready for Implementation

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  - Existing Chatbot.js UI (keep as-is)                      │
│  - Add streaming support for real-time responses            │
│  - Maintain book search integration                         │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/SSE
┌─────────────────────────────────────────────────────────────┐
│              Backend (Flask) - New Endpoint                  │
│  /api/chatbot/conversation                                  │
│  - Receives user message + conversation history             │
│  - Orchestrates RAG + LLM                                   │
│  - Returns streaming or complete response                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    RAG System Layer                          │
│  - Knowledge base (chatbotKnowledge.json → indexed)         │
│  - Book catalog search integration                          │
│  - Patron data integration (for personalization)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    LLM Provider                              │
│  PRIMARY: Anthropic Claude 3.5 Haiku                        │
│  - Fast responses (< 2 seconds)                             │
│  - Cost-effective ($0.80/1M input, $4/1M output)           │
│  - Excellent instruction following                          │
│                                                              │
│  FALLBACK: OpenAI GPT-4o-mini                               │
│  - If Claude fails or for complex queries                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### LLM Selection

**PRIMARY: Anthropic Claude 3.5 Haiku**
- **Why:** Best cost-to-performance ratio
- **Speed:** Sub-2-second responses (critical for chat)
- **Cost:** $0.80/1M input + $4/1M output
- **Context:** 200K tokens (handle long conversations)
- **API:** Simple HTTP API with streaming support

**FALLBACK: OpenAI GPT-4o-mini**
- **Why:** Reliability and availability
- **Cost:** $0.15/1M input + $0.60/1M output
- **Speed:** Very fast
- **Use case:** When Claude is unavailable

### Backend Framework
- **Flask** (existing)
- **Python 3.10+**
- No new dependencies initially (can add LangChain later if needed)

### RAG Implementation
**Phase 1 - Simple (MVP):**
- Load chatbotKnowledge.json directly
- Keyword matching to retrieve relevant sections
- Pass to LLM as context

**Phase 2 - Advanced (Future):**
- Convert knowledge base to vector embeddings
- Use PostgreSQL pgvector for semantic search
- More accurate context retrieval

---

## Implementation Steps

### Step 1: Backend API Endpoint ✅

**File:** `backend/app/routes/chatbot.py` (NEW)

**Endpoint:** `POST /api/chatbot/conversation`

**Request:**
```json
{
  "message": "What are your library hours?",
  "conversation_history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hello! Welcome to Nuk Library..."}
  ],
  "user_id": "optional-patron-id"
}
```

**Response:**
```json
{
  "response": "⏰ LIBRARY HOURS:\n• Tuesday - Sunday: 10:30 AM to 9:00 PM...",
  "context_used": ["hours", "library"],
  "book_results": null
}
```

**Features:**
- Extract relevant context from knowledge base
- Detect book search queries (keep existing logic)
- Call LLM with context + conversation history
- Return structured response

### Step 2: LLM Integration

**Environment Variables Required:**
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # Fallback
```

**LLM Call Structure:**
```python
System Prompt:
You are Nuk Assistant, a helpful AI assistant for Nuk Library in Bengaluru.
You help patrons with:
- Library information (hours, location, facilities)
- Membership plans and pricing
- Book searches and recommendations
- Cowork and study space information

Guidelines:
- Be friendly, concise, and helpful
- Use emojis sparingly for visual appeal
- Format responses clearly with line breaks
- If asked about books, guide users to search our catalog
- Stay on topic (library-related questions only)

Context from knowledge base:
{relevant_knowledge}

User question: {user_message}

Provide a helpful, concise response (max 300 words).
```

### Step 3: Knowledge Base Integration

**Current:** JSON file with structured data
**Strategy:** Simple keyword matching + full context to LLM

```python
def get_relevant_context(user_message):
    # Load chatbotKnowledge.json
    # Match keywords from user message to knowledge sections
    # Return relevant sections as string
    # Example: User asks "hours" → return libraryInfo.hours data
```

### Step 4: Book Search Integration

**Keep existing book search logic:**
- Detect book queries using patterns (already implemented)
- Call existing API: `/api/patron/books/search`
- Format results nicely
- Can enhance with LLM to make results more conversational

### Step 5: Frontend Updates

**Minimal changes to Chatbot.js:**
1. Replace `generateBotResponse()` function
2. Call new backend endpoint `/api/chatbot/conversation`
3. Add conversation history management
4. Optional: Add streaming support (Phase 2)

**What to keep:**
- All existing UI components ✅
- Book search integration ✅
- Quick questions ✅
- Typing indicators ✅

---

## System Prompt Design

```
You are Nuk Assistant, the AI-powered chatbot for Nuk Library, a community library in Bengaluru, India.

ABOUT NUK LIBRARY:
- Location: 1st Floor, PGK Chambers, Hosa Road, Kasavanahalli, Bengaluru 560035
- Contact: +91 725 952 8336, sridhar@mynuk.com
- Library Hours: Tuesday-Sunday 10:30 AM - 9 PM (Closed Mondays)
- Cowork Hours: Mon-Fri 9 AM - 9 PM, Sat-Sun 10 AM - 9 PM

YOUR ROLE:
- Help visitors and members with library information
- Answer questions about memberships, pricing, facilities
- Guide users to search our 10,000+ book catalog
- Provide information about cowork and study spaces
- Give directions and contact information

GUIDELINES:
1. Be warm, friendly, and professional
2. Keep responses concise (under 300 words)
3. Use emojis sparingly for readability (⏰ 📍 📚 💼)
4. Format important information with bullet points
5. If users ask about specific books, encourage them to use our search
6. Stay focused on library-related topics
7. If you don't know something, admit it and offer to connect them with staff
8. Include relevant contact info or links when helpful

KNOWLEDGE BASE CONTEXT:
{knowledge_context}

CONVERSATION HISTORY:
{conversation_history}

USER QUESTION:
{user_message}

Provide a helpful, accurate response based on the knowledge base. If the question is about books in our collection, acknowledge the question and suggest they search our catalog or ask for specific titles.
```

---

## Cost Optimization Strategies

### 1. Caching
```python
# Cache common questions for 24 hours
# "What are your hours?" → Cached response
# Saves ~60% of API calls
```

### 2. Context Minimization
```python
# Only send relevant knowledge sections (not entire JSON)
# Reduces tokens by 70%
```

### 3. Response Length Limiting
```python
# Instruct LLM to keep responses under 300 words
# Reduces output tokens by ~50%
```

### 4. Smart Model Selection
```python
# Use Claude Haiku for 90% of queries
# Only use GPT-4o for complex/ambiguous questions
# Saves 40% on costs
```

**Estimated Monthly Cost:**
- Volume: 3,000 messages/month (100/day)
- Avg input: 500 tokens (system + context + message)
- Avg output: 200 tokens
- Claude Haiku cost: ~$12/month
- With caching: ~$5/month ✅

---

## Security & Privacy

### 1. Rate Limiting
```python
# Limit to 20 messages per IP per hour
# Prevent abuse and cost overruns
```

### 2. Content Filtering
```python
# Detect off-topic or inappropriate queries
# Politely redirect to library topics
```

### 3. No PII Storage
```python
# Don't log personal information
# Conversation history only kept in session
# GDPR compliant
```

### 4. Error Handling
```python
# Graceful fallback to rule-based responses
# If LLM fails, use existing knowledgeBase logic
# Never show raw error messages to users
```

---

## Testing Strategy

### Test Cases

1. **Library Information**
   - "What are your hours?"
   - "Where are you located?"
   - "Do you have parking?"
   - "Is there WiFi?"

2. **Membership Queries**
   - "How much is a membership?"
   - "What plans do you have?"
   - "Can I borrow 3 books?"

3. **Book Searches**
   - "Do you have books on psychology?"
   - "Books by Tolstoy"
   - "Do you have Crime and Punishment?"

4. **Cowork Space**
   - "How much is a cowork desk?"
   - "What are cowork space hours?"
   - "Do you have meeting rooms?"

5. **Edge Cases**
   - Off-topic questions: "What's the weather?"
   - Ambiguous: "Tell me about nuk"
   - Multi-turn conversations

### Success Criteria
- ✅ Response time < 3 seconds
- ✅ Accuracy > 95% for knowledge base questions
- ✅ Graceful handling of off-topic queries
- ✅ Book search integration works seamlessly
- ✅ Conversation context maintained (3-5 turns)

---

## Deployment Plan

### Phase 1: Backend Development (Week 1)
- [ ] Create `/api/chatbot/conversation` endpoint
- [ ] Integrate Anthropic Claude API
- [ ] Implement knowledge base RAG
- [ ] Add book search detection
- [ ] Test API thoroughly

### Phase 2: Frontend Integration (Week 1)
- [ ] Update Chatbot.js to call new endpoint
- [ ] Add conversation history management
- [ ] Test UI with real queries
- [ ] Deploy to staging

### Phase 3: Testing & Refinement (Week 2)
- [ ] User acceptance testing
- [ ] Fix edge cases
- [ ] Optimize prompts for better responses
- [ ] Monitor costs and performance

### Phase 4: Production Deployment (Week 2)
- [ ] Deploy to production
- [ ] Monitor for 48 hours
- [ ] Collect user feedback
- [ ] Iterate on prompts

---

## Monitoring & Analytics

### Metrics to Track
1. **Usage Metrics**
   - Messages per day
   - Unique users
   - Peak hours

2. **Performance Metrics**
   - Average response time
   - API success rate
   - Fallback rate

3. **Cost Metrics**
   - API costs per day
   - Tokens used
   - Cache hit rate

4. **Quality Metrics**
   - User satisfaction (thumbs up/down)
   - Conversation completion rate
   - Escalation to human rate

### Logging
```python
{
  "timestamp": "2025-11-25T10:30:00Z",
  "user_message": "What are your hours?",
  "context_used": ["hours"],
  "model_used": "claude-3-5-haiku",
  "response_time_ms": 1234,
  "tokens_used": {"input": 450, "output": 180},
  "cost_usd": 0.001
}
```

---

## Future Enhancements

### Phase 2 (Month 2-3)
- [ ] Streaming responses for real-time feel
- [ ] Personalization based on user history
- [ ] Multi-language support (Hindi, Kannada)
- [ ] Voice input/output

### Phase 3 (Month 4-6)
- [ ] Proactive suggestions ("Based on your last visit...")
- [ ] Event notifications integration
- [ ] Book recommendations in chat
- [ ] Membership renewal reminders

### Phase 4 (Month 6+)
- [ ] Vector database for semantic search
- [ ] Fine-tuned model on Nuk Library data
- [ ] Integration with patron dashboard
- [ ] Analytics dashboard for admin

---

## Cost Summary

### Development (One-Time)
| Item | Hours | Cost |
|------|-------|------|
| Backend API development | 12 | $900 |
| LLM integration | 8 | $600 |
| Frontend updates | 6 | $450 |
| Testing & QA | 6 | $450 |
| Deployment | 3 | $225 |
| **Total** | **35** | **$2,625** |

### Operational (Monthly)
| Item | Cost |
|------|------|
| Claude API (3k messages/month) | $12 |
| Caching layer (Redis) | $5 |
| Monitoring | $10 |
| **Total** | **$27/month** |

**With optimizations:** ~$15-20/month

---

## Conclusion

This implementation plan provides:
- ✅ Clear technical architecture
- ✅ Step-by-step implementation guide
- ✅ Cost-effective LLM selection
- ✅ Minimal frontend changes
- ✅ Robust testing strategy
- ✅ Scalable for future enhancements

**Ready to implement!** Let's start with the backend API endpoint.

---

**Next Steps:**
1. Set up Anthropic API key
2. Create `backend/app/routes/chatbot.py`
3. Implement RAG with knowledge base
4. Test endpoint
5. Update frontend
