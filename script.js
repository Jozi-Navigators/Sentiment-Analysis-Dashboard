
// Enhanced sentiment analysis data
const positiveWords = ['excellent', 'amazing', 'great', 'wonderful', 'fantastic', 'love', 'perfect', 'awesome', 'outstanding', 'brilliant', 'superb', 'incredible', 'marvelous', 'exceptional', 'delighted', 'satisfied', 'happy', 'pleased', 'good', 'nice', 'beautiful', 'helpful', 'friendly', 'professional', 'quality', 'recommend', 'impressed', 'smooth', 'easy', 'fast', 'reliable', 'best', 'enjoy', 'excited', 'thrilled', 'grateful', 'appreciate', 'success', 'win', 'victory', 'joy', 'cheerful', 'positive', 'optimistic', 'comfortable', 'convenient', 'effective', 'efficient', 'valuable', 'worth', 'benefit'];

const negativeWords = ['terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disappointing', 'poor', 'useless', 'broken', 'slow', 'expensive', 'overpriced', 'rude', 'unprofessional', 'difficult', 'complicated', 'confusing', 'frustrating', 'annoying', 'waste', 'regret', 'problem', 'issue', 'error', 'bug', 'crash', 'fail', 'wrong', 'missing', 'sad', 'angry', 'upset', 'worried', 'concerned', 'disappointed', 'dissatisfied', 'unhappy', 'uncomfortable', 'inconvenient', 'ineffective', 'useless', 'worthless', 'damage', 'loss', 'defeat', 'failure', 'reject', 'deny'];

const neutralWords = ['okay', 'ok', 'fine', 'average', 'normal', 'standard', 'typical', 'usual', 'regular', 'ordinary', 'common', 'basic', 'simple', 'plain', 'adequate', 'sufficient', 'acceptable', 'reasonable', 'fair', 'moderate'];

let sentimentChart = null;
let intensityChart = null;
let wordFrequencyChart = null;
let batchSentimentChart = null;
let batchResults = [];
let currentMode = 'single';

function switchMode(mode) {
    currentMode = mode;
    const singleMode = document.getElementById('singleMode');
    const batchMode = document.getElementById('batchMode');
    const singleBtn = document.getElementById('singleModeBtn');
    const batchBtn = document.getElementById('batchModeBtn');
    const resultsSection = document.getElementById('resultsSection');
    const batchResultsSection = document.getElementById('batchResultsSection');

    if (mode === 'single') {
        singleMode.classList.remove('hidden');
        batchMode.classList.add('hidden');
        singleBtn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
        singleBtn.classList.remove('text-white/70');
        batchBtn.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
        batchBtn.classList.add('text-white/70');
        batchResultsSection.classList.add('hidden');
    } else {
        singleMode.classList.add('hidden');
        batchMode.classList.remove('hidden');
        batchBtn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
        batchBtn.classList.remove('text-white/70');
        singleBtn.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
        singleBtn.classList.add('text-white/70');
        resultsSection.classList.add('hidden');
    }
}

function analyzeSentiment() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        alert('Please enter some text to analyze!');
        return;
    }

    const analysis = performSentimentAnalysis(text);
    displayResults(analysis, text);
}

function performSentimentAnalysis(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;
    let foundPositiveWords = [];
    let foundNegativeWords = [];
    let foundNeutralWords = [];

    // Analyze each word for sentiment
    words.forEach(word => {
        if (positiveWords.includes(word)) {
            positiveScore++;
            if (!foundPositiveWords.includes(word)) {
                foundPositiveWords.push(word);
            }
        } else if (negativeWords.includes(word)) {
            negativeScore++;
            if (!foundNegativeWords.includes(word)) {
                foundNegativeWords.push(word);
            }
        } else if (neutralWords.includes(word)) {
            neutralScore++;
            if (!foundNeutralWords.includes(word)) {
                foundNeutralWords.push(word);
            }
        }
    });

    // If no sentiment words found, consider it neutral based on sentence count
    if (positiveScore === 0 && negativeScore === 0 && neutralScore === 0) {
        neutralScore = sentences.length;
    }

    // Determine overall sentiment with improved logic
    let overallSentiment;
    let sentimentColor;
    let sentimentEmoji;
    let confidence;

    const totalSentimentWords = positiveScore + negativeScore + neutralScore;
    const positivePct = totalSentimentWords > 0 ? (positiveScore / totalSentimentWords) * 100 : 0;
    const negativePct = totalSentimentWords > 0 ? (negativeScore / totalSentimentWords) * 100 : 0;
    const neutralPct = totalSentimentWords > 0 ? (neutralScore / totalSentimentWords) * 100 : 100;

    // More nuanced sentiment determination
    if (positiveScore > negativeScore && positiveScore > neutralScore) {
        overallSentiment = 'Positive';
        sentimentColor = 'text-green-600 bg-green-100';
        sentimentEmoji = '😊';
        confidence = Math.round(positivePct);
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
        overallSentiment = 'Negative';
        sentimentColor = 'text-red-600 bg-red-100';
        sentimentEmoji = '😞';
        confidence = Math.round(negativePct);
    } else if (neutralScore >= positiveScore && neutralScore >= negativeScore) {
        overallSentiment = 'Neutral';
        sentimentColor = 'text-gray-600 bg-gray-100';
        sentimentEmoji = '😐';
        confidence = Math.round(neutralPct);
    } else {
        // Mixed sentiment - close scores
        const diff = Math.abs(positiveScore - negativeScore);
        if (diff <= 1) {
            overallSentiment = 'Mixed';
            sentimentColor = 'text-yellow-600 bg-yellow-100';
            sentimentEmoji = '🤔';
            confidence = 50;
        } else if (positiveScore > negativeScore) {
            overallSentiment = 'Positive';
            sentimentColor = 'text-green-600 bg-green-100';
            sentimentEmoji = '😊';
            confidence = Math.round(positivePct);
        } else {
            overallSentiment = 'Negative';
            sentimentColor = 'text-red-600 bg-red-100';
            sentimentEmoji = '😞';
            confidence = Math.round(negativePct);
        }
    }

    return {
        overall: overallSentiment,
        color: sentimentColor,
        emoji: sentimentEmoji,
        confidence: confidence,
        scores: {
            positive: positiveScore,
            negative: negativeScore,
            neutral: neutralScore
        },
        percentages: {
            positive: Math.round(positivePct),
            negative: Math.round(negativePct),
            neutral: Math.round(neutralPct)
        },
        words: {
            positive: foundPositiveWords,
            negative: foundNegativeWords,
            neutral: foundNeutralWords
        },
        metrics: {
            totalWords: words.length,
            sentences: sentences.length,
            avgWordsPerSentence: Math.round(words.length / sentences.length) || 0,
            sentimentWords: totalSentimentWords
        }
    };
}

function displayResults(analysis, originalText) {
    document.getElementById('resultsSection').classList.remove('hidden');

    // Overall sentiment
    const overallDiv = document.getElementById('overallSentiment');
    overallDiv.innerHTML = `
                <div class="text-center relative">
                    <div class="text-8xl mb-4 emoji-bounce">${analysis.emoji}</div>
                    <div class="text-4xl font-bold text-white mb-4 neon-text">
                        ${analysis.overall} Vibes Detected!
                    </div>
                    <div class="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/30 inline-block">
                        <div class="text-white/90 text-lg">Magic Confidence Level</div>
                        <div class="text-3xl font-bold text-white neon-text">${analysis.confidence}%</div>
                    </div>
                    <div class="absolute -top-4 -left-4 text-3xl animate-spin">✨</div>
                    <div class="absolute -top-4 -right-4 text-3xl animate-bounce">🌟</div>
                    <div class="absolute -bottom-4 -left-4 text-3xl animate-pulse">💫</div>
                    <div class="absolute -bottom-4 -right-4 text-3xl animate-ping">⭐</div>
                </div>
            `;

    // Create/update charts
    createSentimentChart(analysis.scores, analysis.percentages);
    createIntensityChart(analysis.scores);
    createWordFrequencyChart(analysis.words);

    // Generate explanations
    generateChartExplanations(analysis);



    // Word analysis
    const positiveWordsDiv = document.getElementById('positiveWords');
    positiveWordsDiv.innerHTML = analysis.words.positive.length > 0 ?
        analysis.words.positive.map(word =>
            `<span class="word-tag bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium border border-green-400/30 backdrop-blur-sm">${word}</span>`
        ).join('') :
        '<span class="text-white/60 italic">No happy words found in this spell</span>';

    const negativeWordsDiv = document.getElementById('negativeWords');
    negativeWordsDiv.innerHTML = analysis.words.negative.length > 0 ?
        analysis.words.negative.map(word =>
            `<span class="word-tag bg-gradient-to-r from-red-400/20 to-pink-400/20 text-red-300 px-4 py-2 rounded-full text-sm font-medium border border-red-400/30 backdrop-blur-sm">${word}</span>`
        ).join('') :
        '<span class="text-white/60 italic">No grumpy words found in this spell</span>';

    const neutralWordsDiv = document.getElementById('neutralWords');
    neutralWordsDiv.innerHTML = analysis.words.neutral.length > 0 ?
        analysis.words.neutral.map(word =>
            `<span class="word-tag bg-gradient-to-r from-gray-400/20 to-slate-400/20 text-gray-300 px-4 py-2 rounded-full text-sm font-medium border border-gray-400/30 backdrop-blur-sm">${word}</span>`
        ).join('') :
        '<span class="text-white/60 italic">No chill words found in this spell</span>';
}

function createSentimentChart(scores, percentages) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');

    if (sentimentChart) {
        sentimentChart.destroy();
    }

    sentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [scores.positive, scores.negative, scores.neutral],
                backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = percentages[label.toLowerCase()];
                            return `${label}: ${value} words (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createIntensityChart(scores) {
    const ctx = document.getElementById('intensityChart').getContext('2d');

    if (intensityChart) {
        intensityChart.destroy();
    }

    const total = scores.positive + scores.negative + scores.neutral;
    const intensityData = [
        (scores.positive / total * 100) || 0,
        (scores.negative / total * 100) || 0,
        (scores.neutral / total * 100) || 0
    ];

    intensityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Positive Intensity', 'Negative Intensity', 'Neutral Intensity'],
            datasets: [{
                label: 'Sentiment Intensity (%)',
                data: intensityData,
                backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
                borderColor: ['#059669', '#DC2626', '#4B5563'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function createWordFrequencyChart(words) {
    const ctx = document.getElementById('wordFrequencyChart').getContext('2d');

    if (wordFrequencyChart) {
        wordFrequencyChart.destroy();
    }

    // Count word frequencies
    const allWords = [...words.positive, ...words.negative, ...words.neutral];
    const wordCounts = {};
    allWords.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Get top 8 words
    const sortedWords = Object.entries(wordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8);

    const labels = sortedWords.map(([word]) => word);
    const data = sortedWords.map(([, count]) => count);
    const colors = labels.map(word => {
        if (words.positive.includes(word)) return '#10B981';
        if (words.negative.includes(word)) return '#EF4444';
        return '#6B7280';
    });

    wordFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Word Frequency',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color === '#10B981' ? '#059669' : color === '#EF4444' ? '#DC2626' : '#4B5563'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const sentiment = words.positive.includes(context.label) ? 'Positive' :
                                words.negative.includes(context.label) ? 'Negative' : 'Neutral';
                            return `${context.label}: ${context.parsed.x} times (${sentiment})`;
                        }
                    }
                }
            }
        }
    });
}



function generateChartExplanations(analysis) {
    // Sentiment Distribution Explanation
    const chartExplanation = document.getElementById('chartExplanation');
    const dominant = analysis.overall.toLowerCase();
    const dominantScore = analysis.scores[dominant] || 0;
    const totalWords = analysis.scores.positive + analysis.scores.negative + analysis.scores.neutral;

    chartExplanation.innerHTML = `
                <div class="bg-gradient-to-r from-white/10 to-white/5 border-l-4 border-blue-400 p-4 rounded-r-xl backdrop-blur-sm">
                    <p class="text-white font-medium">🔮 <strong>Oracle's Vision:</strong> Your magical text radiates predominantly <strong class="neon-text">${analysis.overall}</strong> energy with ${dominantScore} ${dominant} power words out of ${totalWords} enchanted words!</p>
                </div>
                <div class="text-sm text-white/70 space-y-1">
                    <p>🟢 Green slice = Happy energy (${analysis.percentages.positive}%)</p>
                    <p>🔴 Red slice = Grumpy energy (${analysis.percentages.negative}%)</p>
                    <p>⚪ Gray slice = Chill energy (${analysis.percentages.neutral}%)</p>
                </div>
            `;

    // Intensity Analysis Explanation
    const intensityExplanation = document.getElementById('intensityExplanation');
    const maxIntensity = Math.max(analysis.percentages.positive, analysis.percentages.negative, analysis.percentages.neutral);
    const intensityType = analysis.percentages.positive === maxIntensity ? 'positive' :
        analysis.percentages.negative === maxIntensity ? 'negative' : 'neutral';

    intensityExplanation.innerHTML = `
                <div class="bg-gradient-to-r from-white/10 to-white/5 border-l-4 border-purple-400 p-4 rounded-r-xl backdrop-blur-sm">
                    <p class="text-white font-medium">⚡ <strong>Power Reading:</strong> The ${intensityType} energy field shows maximum power at <strong class="neon-text">${maxIntensity}%</strong> - that's some serious emotional voltage!</p>
                </div>
                <div class="text-sm text-white/70 space-y-1">
                    <p>📊 Taller bars = Stronger magical presence</p>
                    <p>⚖️ Balanced bars = Harmonious energy mix</p>
                    <p>🎯 Single tall bar = Focused emotional beam</p>
                </div>
            `;

    // Word Frequency Explanation
    const wordFrequencyExplanation = document.getElementById('wordFrequencyExplanation');
    const topWords = [...analysis.words.positive, ...analysis.words.negative, ...analysis.words.neutral];
    const mostCommon = topWords.length > 0 ? topWords[0] : 'none';

    wordFrequencyExplanation.innerHTML = `
                <div class="bg-gradient-to-r from-white/10 to-white/5 border-l-4 border-green-400 p-4 rounded-r-xl backdrop-blur-sm">
                    <p class="text-white font-medium">🏆 <strong>Champion Analysis:</strong> This arena reveals which emotional warriors appear most often, showing the true sentiment champions of your text!</p>
                </div>
                <div class="text-sm text-white/70 space-y-1">
                    <p>🟢 Green bars = Happy warriors</p>
                    <p>🔴 Red bars = Grumpy fighters</p>
                    <p>⚪ Gray bars = Chill defenders</p>
                    <p>📏 Longer bars = More battle appearances</p>
                </div>
            `;
}



function loadSampleData() {
    const sampleReviews = [
        "This product is absolutely amazing! The quality exceeded my expectations and the customer service was outstanding. I would definitely recommend this to anyone looking for excellence.",
        "Terrible experience. The product broke after just one day and customer support was completely unhelpful. Total waste of money. Very disappointed.",
        "The product is okay. It's average quality and does what it's supposed to do. Nothing particularly good or bad about it. Fair price for what you get.",
        "I love this! Best purchase I've made in years. The design is beautiful and it works perfectly. Five stars!",
        "Poor quality control. The item arrived damaged and the replacement process was frustrating. Not worth the price.",
        "It's fine, I guess. Normal shipping time and standard packaging. The product is adequate for basic use."
    ];

    document.getElementById('textInput').value = sampleReviews.join('\n\n');
}

function analyzeBatch() {
    const batchText = document.getElementById('batchTextInput').value.trim();
    if (!batchText) {
        alert('Please enter batch text or upload a file!');
        return;
    }

    // Split text into individual items (by double newlines or single newlines)
    const texts = batchText.split(/\n\s*\n/).filter(text => text.trim().length > 0);
    if (texts.length === 0) {
        // Try single newlines if double newlines don't work
        const singleLineTexts = batchText.split('\n').filter(text => text.trim().length > 0);
        if (singleLineTexts.length === 0) {
            alert('No valid text found to analyze!');
            return;
        }
        texts.push(...singleLineTexts);
    }

    // Show loading state
    document.getElementById('batchAnalyzeText').textContent = 'Casting Spells...';

    // Analyze each text
    batchResults = [];
    texts.forEach((text, index) => {
        const analysis = performSentimentAnalysis(text.trim());
        batchResults.push({
            id: index + 1,
            text: text.trim(),
            analysis: analysis
        });
    });

    displayBatchResults();
    document.getElementById('batchAnalyzeText').textContent = 'Analyze Batch Magic';
}

function displayBatchResults() {
    document.getElementById('batchResultsSection').classList.remove('hidden');

    // Calculate batch summary
    const totalTexts = batchResults.length;
    const positiveCount = batchResults.filter(r => r.analysis.overall === 'Positive').length;
    const negativeCount = batchResults.filter(r => r.analysis.overall === 'Negative').length;
    const neutralCount = batchResults.filter(r => r.analysis.overall === 'Neutral').length;
    const mixedCount = batchResults.filter(r => r.analysis.overall === 'Mixed').length;

    // Batch summary
    const summaryDiv = document.getElementById('batchSummary');
    summaryDiv.innerHTML = `
                <div class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-2xl border border-white/20 backdrop-blur-sm text-center">
                    <div class="text-3xl mb-2">📊</div>
                    <div class="text-3xl font-bold text-white neon-text">${totalTexts}</div>
                    <div class="text-sm text-white/80">Total Spells</div>
                </div>
                <div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl border border-white/20 backdrop-blur-sm text-center">
                    <div class="text-3xl mb-2">😊</div>
                    <div class="text-3xl font-bold text-green-400 neon-text">${positiveCount}</div>
                    <div class="text-sm text-white/80">Happy Magic</div>
                </div>
                <div class="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-6 rounded-2xl border border-white/20 backdrop-blur-sm text-center">
                    <div class="text-3xl mb-2">😞</div>
                    <div class="text-3xl font-bold text-red-400 neon-text">${negativeCount}</div>
                    <div class="text-sm text-white/80">Sad Curses</div>
                </div>
                <div class="bg-gradient-to-br from-gray-500/20 to-slate-500/20 p-6 rounded-2xl border border-white/20 backdrop-blur-sm text-center">
                    <div class="text-3xl mb-2">😐</div>
                    <div class="text-3xl font-bold text-gray-400 neon-text">${neutralCount + mixedCount}</div>
                    <div class="text-sm text-white/80">Neutral/Mixed</div>
                </div>
            `;

    // Overall batch sentiment
    const overallDiv = document.getElementById('batchOverallSentiment');
    const dominantSentiment = positiveCount > negativeCount && positiveCount > neutralCount + mixedCount ? 'Positive' :
        negativeCount > positiveCount && negativeCount > neutralCount + mixedCount ? 'Negative' : 'Neutral';
    const dominantEmoji = dominantSentiment === 'Positive' ? '😊' : dominantSentiment === 'Negative' ? '😞' : '😐';

    overallDiv.innerHTML = `
                <div class="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/30 inline-block">
                    <div class="text-6xl mb-4 emoji-bounce">${dominantEmoji}</div>
                    <div class="text-2xl font-bold text-white neon-text">Overall Batch: ${dominantSentiment}</div>
                    <div class="text-white/80 mt-2">${Math.round((dominantSentiment === 'Positive' ? positiveCount : dominantSentiment === 'Negative' ? negativeCount : neutralCount + mixedCount) / totalTexts * 100)}% of your magical texts</div>
                </div>
            `;

    // Create batch charts
    createBatchCharts();

    // Individual results
    const individualDiv = document.getElementById('batchIndividualResults');
    individualDiv.innerHTML = batchResults.map(result => `
                <div class="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm text-white/70">🔮 Spell #${result.id}</span>
                        <span class="bg-gradient-to-r from-white/20 to-white/10 px-4 py-2 rounded-full text-sm font-bold text-white border border-white/30">
                            ${result.analysis.emoji} ${result.analysis.overall} (${result.analysis.confidence}%)
                        </span>
                    </div>
                    <p class="text-white/90 text-sm leading-relaxed">${result.text.length > 150 ? result.text.substring(0, 150) + '...' : result.text}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                        <span class="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">+${result.analysis.scores.positive}</span>
                        <span class="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">-${result.analysis.scores.negative}</span>
                        <span class="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full border border-gray-500/30">=${result.analysis.scores.neutral}</span>
                    </div>
                </div>
            `).join('');
}

function createBatchCharts() {
    // Batch sentiment distribution
    const batchCtx = document.getElementById('batchSentimentChart').getContext('2d');
    if (batchSentimentChart) {
        batchSentimentChart.destroy();
    }

    const sentimentCounts = {
        positive: batchResults.filter(r => r.analysis.overall === 'Positive').length,
        negative: batchResults.filter(r => r.analysis.overall === 'Negative').length,
        neutral: batchResults.filter(r => r.analysis.overall === 'Neutral').length,
        mixed: batchResults.filter(r => r.analysis.overall === 'Mixed').length
    };

    batchSentimentChart = new Chart(batchCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Negative', 'Neutral', 'Mixed'],
            datasets: [{
                data: [sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral, sentimentCounts.mixed],
                backgroundColor: ['#10B981', '#EF4444', '#6B7280', '#F59E0B'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 11 }
                    }
                }
            }
        }
    });


}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        document.getElementById('batchTextInput').value = content;
        document.getElementById('fileStatus').innerHTML = `
                    <div class="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl border border-green-500/30">
                        ✅ File loaded: ${file.name}
                    </div>
                `;
    };
    reader.readAsText(file);
}

function loadBatchSample() {
    const sampleBatch = `Amazing product! Love the quality and fast shipping.

Terrible customer service. Very disappointed with this purchase.

The item is okay, nothing special but does the job.

Outstanding quality! Highly recommend to everyone.

Poor packaging, item arrived damaged. Not happy.

Average product for the price. Fair value.

Excellent experience from start to finish!

Worst purchase ever. Complete waste of money.

Good product, meets expectations. Satisfied.

Incredible service and amazing product quality!`;

    document.getElementById('batchTextInput').value = sampleBatch;
}

function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.toggle('hidden');
}

// Close export menu when clicking outside
document.addEventListener('click', function (event) {
    const exportBtn = document.getElementById('exportBtn');
    const exportMenu = document.getElementById('exportMenu');
    if (exportBtn && !exportBtn.contains(event.target)) {
        exportMenu.classList.add('hidden');
    }
});

function exportBatchResults(format = 'csv') {
    if (batchResults.length === 0) {
        alert('No batch results to export!');
        return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    switch (format) {
        case 'csv':
            exportCSV(timestamp);
            break;
        case 'json':
            exportJSON(timestamp);
            break;
        case 'pdf':
            exportPDF(timestamp);
            break;
        case 'docx':
            exportDOCX(timestamp);
            break;
        case 'html':
            exportHTML(timestamp);
            break;
    }
}

function exportCSV(timestamp) {
    const csvContent = [
        ['ID', 'Text', 'Sentiment', 'Confidence (%)', 'Positive Score', 'Negative Score', 'Neutral Score', 'Total Words', 'Sentiment Words', 'Positive Words Found', 'Negative Words Found', 'Neutral Words Found'],
        ...batchResults.map(result => [
            result.id,
            `"${result.text.replace(/"/g, '""')}"`,
            result.analysis.overall,
            result.analysis.confidence,
            result.analysis.scores.positive,
            result.analysis.scores.negative,
            result.analysis.scores.neutral,
            result.analysis.metrics.totalWords,
            result.analysis.metrics.sentimentWords,
            `"${result.analysis.words.positive.join(', ')}"`,
            `"${result.analysis.words.negative.join(', ')}"`,
            `"${result.analysis.words.neutral.join(', ')}"`,
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, `sentiment_analysis_${timestamp}.csv`, 'text/csv');
}

function exportJSON(timestamp) {
    const jsonData = {
        exportInfo: {
            timestamp: new Date().toISOString(),
            totalAnalyzed: batchResults.length,
            exportFormat: 'JSON'
        },
        summary: {
            totalTexts: batchResults.length,
            positiveCount: batchResults.filter(r => r.analysis.overall === 'Positive').length,
            negativeCount: batchResults.filter(r => r.analysis.overall === 'Negative').length,
            neutralCount: batchResults.filter(r => r.analysis.overall === 'Neutral').length,
            mixedCount: batchResults.filter(r => r.analysis.overall === 'Mixed').length
        },
        chartData: {
            sentimentDistribution: {
                positive: batchResults.filter(r => r.analysis.overall === 'Positive').length,
                negative: batchResults.filter(r => r.analysis.overall === 'Negative').length,
                neutral: batchResults.filter(r => r.analysis.overall === 'Neutral').length,
                mixed: batchResults.filter(r => r.analysis.overall === 'Mixed').length
            }
        },
        results: batchResults.map(result => ({
            id: result.id,
            text: result.text,
            sentiment: {
                overall: result.analysis.overall,
                confidence: result.analysis.confidence,
                emoji: result.analysis.emoji
            },
            scores: result.analysis.scores,
            percentages: result.analysis.percentages,
            words: result.analysis.words,
            metrics: result.analysis.metrics
        }))
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonString, `sentiment_analysis_${timestamp}.json`, 'application/json');
}

async function exportPDF(timestamp) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(75, 85, 99);
    doc.text('🎭 Sentiment Analysis Report', 20, 30);

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
    doc.text(`Total Texts Analyzed: ${batchResults.length}`, 20, 50);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99);
    doc.text('📊 Summary', 20, 70);

    const positiveCount = batchResults.filter(r => r.analysis.overall === 'Positive').length;
    const negativeCount = batchResults.filter(r => r.analysis.overall === 'Negative').length;
    const neutralCount = batchResults.filter(r => r.analysis.overall === 'Neutral').length;
    const mixedCount = batchResults.filter(r => r.analysis.overall === 'Mixed').length;

    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`😊 Positive: ${positiveCount} (${Math.round(positiveCount / batchResults.length * 100)}%)`, 30, 85);

    doc.setTextColor(239, 68, 68); // Red
    doc.text(`😞 Negative: ${negativeCount} (${Math.round(negativeCount / batchResults.length * 100)}%)`, 30, 95);

    doc.setTextColor(107, 114, 128); // Gray
    doc.text(`😐 Neutral: ${neutralCount} (${Math.round(neutralCount / batchResults.length * 100)}%)`, 30, 105);
    doc.text(`🤔 Mixed: ${mixedCount} (${Math.round(mixedCount / batchResults.length * 100)}%)`, 30, 115);

    // Chart Section
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99);
    doc.text('📈 Distribution Chart', 20, 135);

    // Add chart as image
    try {
        const chartCanvas = document.getElementById('batchSentimentChart');
        if (chartCanvas) {
            const chartImage = chartCanvas.toDataURL('image/png');
            doc.addImage(chartImage, 'PNG', 20, 145, 80, 60);
        }
    } catch (error) {
        doc.setFontSize(10);
        doc.setTextColor(239, 68, 68);
        doc.text('Chart could not be exported', 20, 155);
    }

    // Individual Results Section
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99);
    doc.text('📋 Individual Results', 20, 220);

    let yPosition = 235;
    const pageHeight = doc.internal.pageSize.height;

    batchResults.slice(0, 10).forEach((result, index) => {
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 30;
        }

        doc.setFontSize(12);
        doc.setTextColor(75, 85, 99);
        doc.text(`#${result.id}: ${result.analysis.emoji} ${result.analysis.overall} (${result.analysis.confidence}%)`, 20, yPosition);

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        const textPreview = result.text.length > 80 ? result.text.substring(0, 80) + '...' : result.text;
        const lines = doc.splitTextToSize(textPreview, 170);
        doc.text(lines, 20, yPosition + 8);

        yPosition += 20 + (lines.length * 4);
    });

    if (batchResults.length > 10) {
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`... and ${batchResults.length - 10} more results`, 20, yPosition + 10);
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Generated by Sentiment Wizard - Page ${i} of ${totalPages}`, 20, pageHeight - 10);
    }

    doc.save(`sentiment_analysis_report_${timestamp}.pdf`);
}

function exportDOCX(timestamp) {
    // Create DOCX content using HTML structure that can be opened by Word
    const positiveCount = batchResults.filter(r => r.analysis.overall === 'Positive').length;
    const negativeCount = batchResults.filter(r => r.analysis.overall === 'Negative').length;
    const neutralCount = batchResults.filter(r => r.analysis.overall === 'Neutral').length;
    const mixedCount = batchResults.filter(r => r.analysis.overall === 'Mixed').length;

    const docxContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sentiment Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #4c63d2; text-align: center; border-bottom: 3px solid #4c63d2; padding-bottom: 10px; }
        h2 { color: #5a4fcf; margin-top: 30px; }
        h3 { color: #666; }
        .summary { background: #f8f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .result-item { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .positive { border-left: 5px solid #10B981; background: #f0fdf4; }
        .negative { border-left: 5px solid #EF4444; background: #fef2f2; }
        .neutral { border-left: 5px solid #6B7280; background: #f9fafb; }
        .mixed { border-left: 5px solid #F59E0B; background: #fffbeb; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 15px; background: #f1f5f9; border-radius: 8px; }
        .confidence { font-weight: bold; color: #4c63d2; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #4c63d2; color: white; }
        .word-list { font-style: italic; color: #666; }
    </style>
</head>
<body>
    <h1>🎭 Sentiment Analysis Report</h1>
    
    <div class="summary">
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Texts Analyzed:</strong> ${batchResults.length}</p>
        <p><strong>Analysis Method:</strong> AI-Powered Sentiment Detection</p>
    </div>

    <h2>📊 Executive Summary</h2>
    <div class="stats">
        <div class="stat-box">
            <h3>😊 Positive</h3>
            <p><strong>${positiveCount}</strong> (${Math.round(positiveCount / batchResults.length * 100)}%)</p>
        </div>
        <div class="stat-box">
            <h3>😞 Negative</h3>
            <p><strong>${negativeCount}</strong> (${Math.round(negativeCount / batchResults.length * 100)}%)</p>
        </div>
        <div class="stat-box">
            <h3>😐 Neutral</h3>
            <p><strong>${neutralCount}</strong> (${Math.round(neutralCount / batchResults.length * 100)}%)</p>
        </div>
        <div class="stat-box">
            <h3>🤔 Mixed</h3>
            <p><strong>${mixedCount}</strong> (${Math.round(mixedCount / batchResults.length * 100)}%)</p>
        </div>
    </div>

    <h2>📋 Detailed Analysis Results</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Text Preview</th>
                <th>Sentiment</th>
                <th>Confidence</th>
                <th>Scores (P/N/Neu)</th>
                <th>Key Words</th>
            </tr>
        </thead>
        <tbody>
            ${batchResults.map(result => `
            <tr class="${result.analysis.overall.toLowerCase()}">
                <td>${result.id}</td>
                <td>${result.text.length > 100 ? result.text.substring(0, 100) + '...' : result.text}</td>
                <td>${result.analysis.emoji} ${result.analysis.overall}</td>
                <td class="confidence">${result.analysis.confidence}%</td>
                <td>${result.analysis.scores.positive}/${result.analysis.scores.negative}/${result.analysis.scores.neutral}</td>
                <td class="word-list">
                    ${[...result.analysis.words.positive.slice(0, 3), ...result.analysis.words.negative.slice(0, 3)].join(', ') || 'No key words'}
                </td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <h2>📈 Analysis Insights</h2>
    <div class="summary">
        <h3>Overall Sentiment Trend</h3>
        <p>The batch analysis reveals a <strong>${positiveCount > negativeCount ? 'predominantly positive' : negativeCount > positiveCount ? 'predominantly negative' : 'balanced'}</strong> sentiment pattern across all analyzed texts.</p>
        
        <h3>Key Findings</h3>
        <ul>
            <li><strong>Dominant Sentiment:</strong> ${positiveCount >= Math.max(negativeCount, neutralCount, mixedCount) ? 'Positive' : negativeCount >= Math.max(positiveCount, neutralCount, mixedCount) ? 'Negative' : 'Neutral/Mixed'}</li>
            <li><strong>Sentiment Distribution:</strong> ${Math.round((Math.max(positiveCount, negativeCount, neutralCount + mixedCount) / batchResults.length) * 100)}% of texts share the dominant sentiment</li>
            <li><strong>Analysis Confidence:</strong> Average confidence level across all results</li>
        </ul>
    </div>

    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>Generated by Sentiment Wizard - Advanced AI Sentiment Analysis Tool</p>
        <p>Report created on ${new Date().toLocaleString()}</p>
    </footer>
</body>
</html>`;

    downloadFile(docxContent, `sentiment_analysis_report_${timestamp}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

function exportHTML(timestamp) {
    const positiveCount = batchResults.filter(r => r.analysis.overall === 'Positive').length;
    const negativeCount = batchResults.filter(r => r.analysis.overall === 'Negative').length;
    const neutralCount = batchResults.filter(r => r.analysis.overall === 'Neutral').length;
    const mixedCount = batchResults.filter(r => r.analysis.overall === 'Mixed').length;

    // Get chart data as base64 image
    let chartImageData = '';
    try {
        const chartCanvas = document.getElementById('batchSentimentChart');
        if (chartCanvas) {
            chartImageData = chartCanvas.toDataURL('image/png');
        }
    } catch (error) {
        console.log('Chart export not available');
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentiment Analysis Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #4c63d2 0%, #5a4fcf 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: rgba(255,255,255,0.95); 
            padding: 40px; 
            border-radius: 20px; 
            text-align: center; 
            margin-bottom: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header h1 { 
            font-size: 3rem; 
            color: #4c63d2; 
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .header p { color: #666; font-size: 1.2rem; }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .summary-card { 
            background: rgba(255,255,255,0.95); 
            padding: 30px; 
            border-radius: 15px; 
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .summary-card:hover { transform: translateY(-5px); }
        .summary-card h3 { font-size: 2.5rem; margin-bottom: 10px; }
        .summary-card .number { font-size: 2rem; font-weight: bold; color: #4c63d2; }
        .summary-card .percentage { color: #666; font-size: 1.1rem; }
        .chart-section { 
            background: rgba(255,255,255,0.95); 
            padding: 40px; 
            border-radius: 20px; 
            margin: 30px 0;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .chart-section h2 { color: #4c63d2; margin-bottom: 20px; text-align: center; }
        .chart-container { text-align: center; margin: 20px 0; }
        .chart-container img { max-width: 100%; height: auto; border-radius: 10px; }
        .results-section { 
            background: rgba(255,255,255,0.95); 
            padding: 40px; 
            border-radius: 20px; 
            margin: 30px 0;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .results-grid { 
            display: grid; 
            gap: 20px; 
            margin-top: 20px; 
        }
        .result-item { 
            padding: 25px; 
            border-radius: 15px; 
            border-left: 5px solid;
            transition: transform 0.2s ease;
        }
        .result-item:hover { transform: translateX(5px); }
        .result-item.positive { border-color: #10B981; background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
        .result-item.negative { border-color: #EF4444; background: linear-gradient(135deg, #fef2f2, #fee2e2); }
        .result-item.neutral { border-color: #6B7280; background: linear-gradient(135deg, #f9fafb, #f3f4f6); }
        .result-item.mixed { border-color: #F59E0B; background: linear-gradient(135deg, #fffbeb, #fef3c7); }
        .result-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 15px; 
        }
        .result-id { font-weight: bold; color: #4c63d2; }
        .sentiment-badge { 
            padding: 8px 16px; 
            border-radius: 25px; 
            font-weight: bold; 
            color: white;
            background: linear-gradient(135deg, #4c63d2, #5a4fcf);
        }
        .result-text { 
            font-size: 1.1rem; 
            margin-bottom: 15px; 
            color: #444;
        }
        .word-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .word-tag { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 0.9rem; 
            font-weight: 500;
        }
        .word-tag.positive { background: #dcfce7; color: #166534; }
        .word-tag.negative { background: #fee2e2; color: #991b1b; }
        .word-tag.neutral { background: #f3f4f6; color: #374151; }
        .insights { 
            background: linear-gradient(135deg, #e0e7ff, #c7d2fe); 
            padding: 30px; 
            border-radius: 15px; 
            margin: 30px 0;
        }
        .insights h3 { color: #4c63d2; margin-bottom: 15px; }
        .insights ul { margin-left: 20px; }
        .insights li { margin-bottom: 8px; }
        .footer { 
            text-align: center; 
            padding: 30px; 
            color: rgba(255,255,255,0.8); 
            margin-top: 50px;
        }
        .interactive-note {
            background: rgba(255,255,255,0.1);
            border: 2px dashed rgba(255,255,255,0.3);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            color: white;
            margin: 20px 0;
        }
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header h1 { font-size: 2rem; }
            .summary-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 Sentiment Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p><strong>${batchResults.length}</strong> texts analyzed with AI-powered sentiment detection</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>😊</h3>
                <div class="number">${positiveCount}</div>
                <div class="percentage">${Math.round(positiveCount / batchResults.length * 100)}% Positive</div>
            </div>
            <div class="summary-card">
                <h3>😞</h3>
                <div class="number">${negativeCount}</div>
                <div class="percentage">${Math.round(negativeCount / batchResults.length * 100)}% Negative</div>
            </div>
            <div class="summary-card">
                <h3>😐</h3>
                <div class="number">${neutralCount}</div>
                <div class="percentage">${Math.round(neutralCount / batchResults.length * 100)}% Neutral</div>
            </div>
            <div class="summary-card">
                <h3>🤔</h3>
                <div class="number">${mixedCount}</div>
                <div class="percentage">${Math.round(mixedCount / batchResults.length * 100)}% Mixed</div>
            </div>
        </div>

        ${chartImageData ? `
        <div class="chart-section">
            <h2>📊 Sentiment Distribution</h2>
            <div class="chart-container">
                <img src="${chartImageData}" alt="Sentiment Distribution Chart" />
            </div>
        </div>
        ` : `
        <div class="interactive-note">
            <h3>📊 Interactive Chart Available</h3>
            <p>The full interactive sentiment distribution chart is available in the original Sentiment Wizard application.</p>
        </div>
        `}

        <div class="insights">
            <h3>📈 Key Insights</h3>
            <ul>
                <li><strong>Overall Trend:</strong> ${positiveCount > negativeCount ? 'Predominantly positive sentiment detected' : negativeCount > positiveCount ? 'Predominantly negative sentiment detected' : 'Balanced sentiment distribution'}</li>
                <li><strong>Dominant Category:</strong> ${positiveCount >= Math.max(negativeCount, neutralCount, mixedCount) ? 'Positive' : negativeCount >= Math.max(positiveCount, neutralCount, mixedCount) ? 'Negative' : 'Neutral/Mixed'} sentiment leads with ${Math.round((Math.max(positiveCount, negativeCount, neutralCount + mixedCount) / batchResults.length) * 100)}% of texts</li>
                <li><strong>Sentiment Diversity:</strong> ${batchResults.length > 10 ? 'Large sample size provides reliable sentiment analysis' : 'Focused analysis on key texts'}</li>
                <li><strong>Analysis Quality:</strong> AI-powered detection with confidence scoring for each result</li>
            </ul>
        </div>

        <div class="results-section">
            <h2>📋 Individual Analysis Results</h2>
            <div class="results-grid">
                ${batchResults.map(result => `
                <div class="result-item ${result.analysis.overall.toLowerCase()}">
                    <div class="result-header">
                        <span class="result-id">Analysis #${result.id}</span>
                        <span class="sentiment-badge">
                            ${result.analysis.emoji} ${result.analysis.overall} (${result.analysis.confidence}%)
                        </span>
                    </div>
                    <div class="result-text">
                        "${result.text.length > 200 ? result.text.substring(0, 200) + '...' : result.text}"
                    </div>
                    <div class="word-tags">
                        ${result.analysis.words.positive.slice(0, 3).map(word => `<span class="word-tag positive">+${word}</span>`).join('')}
                        ${result.analysis.words.negative.slice(0, 3).map(word => `<span class="word-tag negative">-${word}</span>`).join('')}
                        ${result.analysis.words.neutral.slice(0, 2).map(word => `<span class="word-tag neutral">${word}</span>`).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="footer">
            <p>🎭 Generated by Sentiment Wizard</p>
            <p>Advanced AI-Powered Sentiment Analysis Tool</p>
            <p>Report created: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

    downloadFile(htmlContent, `sentiment_analysis_report_${timestamp}.html`, 'text/html');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function clearAll() {
    document.getElementById('textInput').value = '';
    document.getElementById('batchTextInput').value = '';
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('batchResultsSection').classList.add('hidden');
    document.getElementById('fileStatus').innerHTML = '';
    batchResults = [];

    // Destroy all charts
    [sentimentChart, intensityChart, wordFrequencyChart, batchSentimentChart].forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    sentimentChart = intensityChart = wordFrequencyChart = batchSentimentChart = null;
}

