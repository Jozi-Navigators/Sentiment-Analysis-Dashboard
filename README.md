# Sentiment-Analysis-Dashboard 
Sentiment Analysis with Google Cloud Natural Language API
This project provides a thorough assessment of sentiment analysis using the Google Cloud Natural Language API, comparing automated results to manual analysis. It highlights the API’s strengths, limitations, and practical applications in analyzing user feedback from social media, customer reviews, and support requests.
Features
- Automated sentiment classification (positive, neutral, negative)
- Confidence scoring to show certainty of predictions
- Support for multiple languages
- Example workflows with real-world data
- Accuracy benchmarking against human annotation
Project Structure
├── data/                 # Raw and cleaned text samples
├── notebooks/            # Jupyter notebooks with experiments
├── src/                  # Implementation scripts
├── docs/                 # Full project documentation
└── README.md             # Project overview
Installation
### Prerequisites
- Python 3.8+
- Google Cloud account with Natural Language API enabled
- Service account key (JSON file)
### Setup
```
# Clone repository
git clone https://github.com/username/sentiment-analysis.git
cd sentiment-analysis

# Create virtual environment
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)

# Install dependencies
pip install -r requirements.txt
```
Usage
### Run sentiment analysis
```
python src/analyze_sentiment.py --input sample_text.txt
```

### Example Output
```
Text: "The customer service was awful, but the product is fine."
Sentiment: Negative
Confidence: 0.82
```
Accuracy Evaluation
- Manual human annotation vs API results compared
- Identified strengths:
  - High accuracy on clearly positive/negative texts
  - Multi-language support
- Identified weaknesses:
  - Struggles with sarcasm, mixed emotions, and domain-specific jargon

For detailed evaluation, see the Accuracy Report in docs/.
Known Challenges
- Preprocessing needed for noisy social media text (emojis, hashtags, slang)
- Limited interpretability (no word-level explanations)
- API costs at large scale
- Domain-specific language handling
Contributing
1. Fork the repository
2. Create a new feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Added feature"`)
4. Push to your branch (`git push origin feature-name`)
5. Submit a pull request
License
Distributed under the MIT License. See LICENSE for more details.
Author
Your Name – GitHub | LinkedIn
