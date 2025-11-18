# Nuk Library Chatbot - Query Reference

## Supported Query Types

### 1. Facility & Services

**Sample Queries:**
- "What are your timings?"
- "When are you open?"
- "What time do you close?"
- "Are you open on weekends?"
- "What services do you offer?"

**Response Pattern:**
- Operating hours for weekdays and weekends
- Library closure on Mondays (facility remains open)
- Holiday closure information

---

### 2. Infrastructure

#### Wi-Fi
**Queries:** "Do you have WiFi?", "Is internet available?", "Wi-Fi speed?"
**Response:** "Wi-Fi: Yes, high-speed Wi-Fi available"

#### Air Conditioning
**Queries:** "Is it air conditioned?", "Do you have AC?", "Is there cooling?"
**Response:** "Air Conditioning: Yes, fully air-conditioned"

#### Restrooms
**Queries:** "Restroom facilities?", "Where's the toilet?", "Washroom available?"
**Response:** "Restrooms: Yes, clean restrooms available"

#### Power Backup
**Queries:** "Power backup?", "What about electricity cuts?", "UPS available?"
**Response:** "Power Backup: Yes, complete power backup"

---

### 3. Membership & Pricing

#### General Membership
**Queries:** "How much is membership?", "Library plans?", "Membership cost?"
**Response:** Overview of library membership, cowork, and study space options

#### Cowork Space
**Queries:** "Cowork pricing?", "How much for dedicated desk?", "Cowork subscription?"
**Response:** Details about hot desk and dedicated desk options

#### Study Space
**Queries:** "Study space cost?", "Hourly rates?", "Can I book study space?"
**Response:** Information about hourly, daily, and monthly study space plans

---

### 4. Availability

#### Seating
**Queries:** "Seating available?", "Is there space today?", "How many seats?"
**Response:** Information about space availability (real-time if integrated)

#### Meeting Room
**Queries:** "Meeting room availability?", "Can I book a meeting room?", "Meeting room price?"
**Response:** Details about meeting room booking and pricing

---

### 5. Location & Access

#### Address
**Queries:** "Where are you?", "What's your address?", "Location?", "How to reach?"
**Response:** Address, area, and directions information

#### Parking
**Queries:** "Parking available?", "Where can I park?", "Car parking?"
**Response:** "Parking: Limited street parking available"

---

### 6. Catalogue Queries

#### By Title
**Queries:**
- "Do you have 'The Alchemist'?"
- "Book title: Harry Potter"
- "Is 'Sapiens' available?"

**Response Pattern:**
- Found: "Yes! We have '[Title]' by [Author]. Log in to see availability."
- Multiple: List up to 3 matches
- Not found: "Sorry, we don't have '[Title]' in our current catalogue."

#### By Author
**Queries:**
- "Books by J.K. Rowling?"
- "Do you have books by author Ruskin Bond?"
- "Anything written by Agatha Christie?"

**Response Pattern:**
- Found: List up to 3 books by the author
- Not found: "Sorry, we don't have books by [Author]."

#### By ISBN
**Queries:**
- "Do you have ISBN 9780143442295?"
- "978-0-14-344229-5"
- "Book with ISBN 9780143442295"

**Response Pattern:**
- Found: "Yes! We have '[Title]' by [Author]. Log in to see availability."
- Not found: "Sorry, we don't have a book with ISBN [number]."

---

## Query Processing Logic

### Pattern Matching Priority

1. **ISBN Detection** (highest priority)
   - Regex: `\b\d{10,13}\b`
   - Searches books by ISBN

2. **Author Detection**
   - Keywords: "by", "author", "written"
   - Extracts author name after keyword
   - Searches contributors table

3. **Title Detection**
   - Keywords: "book", "have", "title"
   - Searches book titles

4. **Infrastructure Queries**
   - Specific keywords trigger specific responses
   - Fast, pre-defined answers

5. **Fallback**
   - Shows help menu with all capabilities

---

## Response Templates

### Welcome Message
```
Hi! I'm Nuk's assistant. I can help you with information about our services, facilities, membership plans, and book availability. What would you like to know?
```

### Help/Unknown Query
```
I can help you with:

- Library timings and hours
- Facilities (Wi-Fi, AC, restrooms, parking)
- Membership and pricing plans
- Book availability (search by title, author, or ISBN)
- Location and directions

What would you like to know?
```

### Book Search - Single Result
```
Yes! We have '[Title]' by [Author]. Log in to see availability.
```

### Book Search - Multiple Results
```
We have [N] books matching '[Query]':

- [Book 1] by [Author 1]
- [Book 2] by [Author 2]
- [Book 3] by [Author 3]

...and more! Log in to browse our full catalogue.
```

### Book Search - No Results
```
Sorry, we don't have '[Query]' in our current catalogue. We're always adding new books!
```

---

## Quick Questions (Suggested Prompts)

Display these when chat opens:

1. "What are your library timings?"
2. "Do you have cowork space?"
3. "What are the membership plans?"
4. "Where are you located?"

---

## Access Levels

### Anonymous Users
- Can ask all queries
- Book search shows: Title, Author
- Cannot see: Availability, borrow status
- Prompted to login for full access

### Logged-in Patrons
- All anonymous features +
- Real-time availability
- Can see borrowing status
- Can add to wishlist

### Admin Users
- All patron features +
- Can see all member activities
- Can access admin-specific queries
- Can modify catalogue from chat (future feature)

---

## Database Queries Used

### Book by Title
```sql
SELECT b.title, c.name as author
FROM books b
LEFT JOIN book_contributors bc ON b.book_id = bc.book_id AND bc.role = 'author'
LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
WHERE LOWER(b.title) LIKE %pattern% AND b.is_active = TRUE
LIMIT 5
```

### Book by Author
```sql
SELECT b.title, c.name as author
FROM books b
JOIN book_contributors bc ON b.book_id = bc.book_id
JOIN contributors c ON bc.contributor_id = c.contributor_id
WHERE LOWER(c.name) LIKE %pattern% AND b.is_active = TRUE
LIMIT 5
```

### Book by ISBN
```sql
SELECT b.title, c.name as author
FROM books b
LEFT JOIN book_contributors bc ON b.book_id = bc.book_id AND bc.role = 'author'
LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
WHERE b.isbn = %isbn% AND b.is_active = TRUE
LIMIT 1
```

---

## Future Enhancements

### Phase 2 Features
- [ ] Natural language date parsing ("Do you have slots tomorrow?")
- [ ] Multi-turn conversations (context awareness)
- [ ] Personalized recommendations based on history
- [ ] Voice input support
- [ ] Multi-language support (English, Hindi, Kannada)

### AI Integration (Optional)
- [ ] Claude API for complex queries
- [ ] Semantic search for books
- [ ] Reading recommendations
- [ ] Event suggestions based on interests

### Advanced Catalogue Features
- [ ] "Similar books" suggestions
- [ ] Genre-based search
- [ ] Age-appropriate recommendations
- [ ] New arrivals notification

### Booking Integration
- [ ] Book cowork space via chat
- [ ] Check real-time availability
- [ ] Make reservations
- [ ] Payment links

---

## Testing Scenarios

### Test Cases

1. **Basic Queries**
   - ✓ "Hello"
   - ✓ "What are your timings?"
   - ✓ "Do you have WiFi?"

2. **Book Search**
   - ✓ "Do you have The Alchemist?"
   - ✓ "Books by Paulo Coelho"
   - ✓ "ISBN 9780062315007"

3. **Membership**
   - ✓ "How much is membership?"
   - ✓ "Cowork pricing"
   - ✓ "Study space rates"

4. **Edge Cases**
   - ✓ Empty query
   - ✓ Very long query
   - ✓ Special characters
   - ✓ Book not in catalogue
   - ✓ Misspelled author names

5. **Performance**
   - ✓ Response time < 2 seconds
   - ✓ Handle concurrent users
   - ✓ Database query optimization

---

## Configuration

### Environment Variables

```bash
# In backend/.env
CLAUDE_API_KEY=sk-ant-xxx  # Optional, for AI features
CHATBOT_MAX_RESULTS=5      # Max books in search results
CHATBOT_RESPONSE_TIMEOUT=5 # Seconds before timeout
```

### Rate Limiting

```python
# Recommended limits
@limiter.limit("20 per minute")  # Anonymous users
@limiter.limit("50 per minute")  # Logged-in users
```

---

## Monitoring & Analytics

### Track These Metrics

1. **Usage Statistics**
   - Queries per day
   - Popular query types
   - Peak usage hours

2. **Performance**
   - Average response time
   - Failed queries
   - Timeout rate

3. **User Behavior**
   - Most searched books
   - Common questions
   - Conversion to login (anonymous → member)

4. **Query Categories Distribution**
   - % Catalogue queries
   - % Facility info
   - % Pricing questions
   - % Location queries

---

## Maintenance

### Regular Updates Needed

1. **Facility Information**
   - Update hours if changed
   - Update infrastructure details
   - Update pricing periodically

2. **Response Templates**
   - Refine based on user feedback
   - Add seasonal messages
   - Update promotional content

3. **Database Optimization**
   - Index frequently searched fields
   - Cache common queries
   - Archive old chat logs

---

**Version:** 1.0
**Last Updated:** 2025-11-18
**Maintained By:** Nuk Library Tech Team
