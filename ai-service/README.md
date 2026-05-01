# Smart Job AI Service

This service provides semantic matching and text embeddings using the `sentence-transformers` library.

## Integration Points

### POST /api/v1/match

Matches a query string against a list of jobs.

**Request:**

```json
{
  "query": "software engineer with node.js experience",
  "jobs": [
    {
      "id": "uuid-1",
      "title": "Senior Backend Developer",
      "description": "We are looking for a Node.js expert..."
    }
  ]
}
```

**Response:**

```json
{
  "results": [
    {
      "job_id": "uuid-1",
      "score": 0.85
    }
  ]
}
```

### POST /api/v1/similarity

Calculates the cosine similarity between two texts.

**Request:**

```json
{
  "text1": "text one",
  "text2": "text two"
}
```

**Response:**

```json
{
  "score": 0.75
}
```

### POST /api/v1/embedding

Returns the vector embedding for a given text.

**Request:**

```json
{
  "text": "sample text"
}
```

**Response:**

```json
{
  "embedding": [0.1, 0.2, ...]
}
```

## Performance & Caching

- **Redis Caching:** Match results are cached for 1 hour based on the MD5 hash of the query and job IDs.
- **GPU Acceleration:** The service automatically uses CUDA if available.
- **Multilingual Support:** Uses `paraphrase-multilingual-MiniLM-L12-v2` model.
