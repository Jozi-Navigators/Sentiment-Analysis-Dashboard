
        // Global variables
        let currentMode = 'single';
        let batchTexts = [];
        let batchResults = [];
        let currentKeywordView = 'impact';
        let keywordAnalysisData = {};
        let currentAnalysisResult = null;

        // Advanced multi-class sentiment analysis data
        const sentimentWords = {
            positive: {
                strong: ['amazing', 'excellent', 'fantastic', 'outstanding', 'brilliant', 'superb', 'incredible', 'marvelous', 'exceptional', 'perfect', 'wonderful', 'awesome', 'phenomenal', 'spectacular', 'magnificent'],
                moderate: ['great', 'good', 'nice', 'pleasant', 'satisfying', 'enjoyable', 'impressive', 'solid', 'decent', 'fine', 'okay', 'acceptable'],
                mild: ['like', 'appreciate', 'enjoy', 'pleased', 'happy', 'satisfied', 'content', 'glad', 'comfortable', 'positive', 'optimistic']
            },
            negative: {
                strong: ['terrible', 'awful', 'horrible', 'disgusting', 'atrocious', 'appalling', 'dreadful', 'abysmal', 'catastrophic', 'disastrous', 'hate', 'despise', 'loathe'],
                moderate: ['bad', 'poor', 'disappointing', 'unsatisfactory', 'inadequate', 'subpar', 'mediocre', 'inferior', 'deficient', 'lacking'],
                mild: ['annoying', 'frustrating', 'concerning', 'problematic', 'unfortunate', 'sad', 'upset', 'dissatisfied', 'unhappy', 'worried', 'confused']
            },
            neutral: {
                factual: ['is', 'was', 'has', 'have', 'will', 'would', 'could', 'should', 'might', 'may', 'can', 'do', 'does', 'did'],
                descriptive: ['product', 'service', 'company', 'item', 'feature', 'function', 'design', 'color', 'size', 'price', 'cost', 'delivery', 'shipping'],
                transitional: ['however', 'although', 'but', 'yet', 'still', 'nevertheless', 'nonetheless', 'meanwhile', 'furthermore', 'moreover']
            }
        };

        // Sentiment modifiers that affect intensity
        const sentimentModifiers = {
            intensifiers: ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'quite', 'highly', 'exceptionally'],
            diminishers: ['somewhat', 'rather', 'fairly', 'slightly', 'moderately', 'reasonably', 'pretty', 'kind of', 'sort of'],
            negators: ['not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor', 'hardly', 'barely', 'scarcely']
        };

        const templates = {
            review: "This product exceeded my expectations! The quality is amazing and delivery was super fast. However, the packaging could be improved. Overall, I'm very satisfied with my purchase and would definitely recommend it to others. The customer service team was also incredibly helpful when I had questions.",
            social: "Just had the most incredible experience at the new restaurant downtown! 🍕 The food was absolutely delicious and the staff were so friendly. Can't wait to go back! #foodie #restaurant #amazing However, it was quite crowded and we had to wait a bit for our table.",
            feedback: "I really appreciate the flexible work environment and supportive team culture. The management is understanding and the projects are challenging in a good way. However, I think we could improve our communication processes and maybe have more team building activities. Overall, I'm happy to be part of this organization."
        };

        // Batch sample datasets
        const batchSamples = {
            reviews: [
                "This product is absolutely amazing! The quality exceeded my expectations and shipping was incredibly fast. Highly recommend!",
                "Terrible experience. The item arrived damaged and customer service was completely unhelpful. Very disappointed.",
                "Good product overall. Works as expected, though the price could be better. Decent quality for the money.",
                "Outstanding service! The team went above and beyond to help me. The product is fantastic and arrived perfectly packaged.",
                "Not what I expected. The description was misleading and the product feels cheap. Wouldn't buy again."
            ],
            social: [
                "Just had the best coffee ever at the new café downtown! ☕ The atmosphere is perfect and staff are so friendly! #coffee #love",
                "Ugh, stuck in traffic again 😤 This commute is getting worse every day. Need to find a better route or work from home more.",
                "Beautiful sunset tonight 🌅 Sometimes you just need to stop and appreciate the simple things in life. Feeling grateful.",
                "Movie night with friends was epic! 🎬 We laughed so hard. Nothing beats good company and great entertainment.",
                "Disappointed with the new restaurant. Food was cold and service was slow. Expected much better based on the reviews.",
                "Excited about the weekend plans! Going hiking with the family. Can't wait to disconnect and enjoy nature 🏔️"
            ],
            feedback: [
                "I love working here! The team is supportive, management is understanding, and the work-life balance is excellent. Great company culture.",
                "The workload has been overwhelming lately. We need better resource allocation and clearer priorities. Feeling stressed and burned out.",
                "Good workplace overall. The benefits are decent and colleagues are helpful. Some processes could be more efficient though.",
                "Management needs improvement. Communication is poor and decisions seem arbitrary. The work itself is interesting but leadership is lacking."
            ]
        };

        // Mode switching
        function switchMode(mode) {
            currentMode = mode;
            const singleBtn = document.getElementById('singleModeBtn');
            const batchBtn = document.getElementById('batchModeBtn');
            const singleSection = document.getElementById('singleAnalysisSection');
            const batchSection = document.getElementById('batchProcessingSection');
            const resultsSection = document.getElementById('resultsSection');

            if (mode === 'single') {
                singleBtn.className = 'px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2';
                batchBtn.className = 'px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-400 flex items-center gap-2';
                singleSection.classList.remove('hidden');
                batchSection.classList.add('hidden');
                // Keep results section visible if there are results
            } else {
                batchBtn.className = 'px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2';
                singleBtn.className = 'px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-400 flex items-center gap-2';
                singleSection.classList.add('hidden');
                batchSection.classList.remove('hidden');
                resultsSection.classList.add('hidden');
            }
        }

        // Batch processing functions
        function addBatchTexts() {
            const input = document.getElementById('batchTextInput');
            const text = input.value.trim();
            
            if (!text) {
                alert('Please enter some text to add to the batch!');
                return;
            }

            // Split by double newlines or single newlines if no double newlines found
            let texts = text.split(/\n\s*\n/).filter(t => t.trim().length > 0);
            if (texts.length === 1) {
                texts = text.split('\n').filter(t => t.trim().length > 0);
            }

            texts.forEach(t => {
                const trimmed = t.trim();
                if (trimmed.length > 10) { // Minimum length check
                    batchTexts.push({
                        id: Date.now() + Math.random(),
                        text: trimmed,
                        source: 'manual'
                    });
                }
            });

            input.value = '';
            updateBatchQueue();
        }

        function handleBatchFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                let content = e.target.result;
                let texts = [];

                try {
                    if (file.name.endsWith('.json')) {
                        const jsonData = JSON.parse(content);
                        if (Array.isArray(jsonData)) {
                            texts = jsonData.map(item => {
                                if (typeof item === 'string') return item;
                                return item.text || item.content || item.message || JSON.stringify(item);
                            });
                        } else if (jsonData.texts) {
                            texts = jsonData.texts;
                        } else {
                            texts = [JSON.stringify(jsonData, null, 2)];
                        }
                    } else if (file.name.endsWith('.csv')) {
                        const lines = content.split('\n');
                        // Try to detect if first line is header
                        const hasHeader = lines[0] && (lines[0].toLowerCase().includes('text') || lines[0].toLowerCase().includes('content'));
                        const startIndex = hasHeader ? 1 : 0;
                        
                        texts = lines.slice(startIndex).map(line => {
                            const columns = line.split(',');
                            // Take the longest column as it's likely the text content
                            return columns.reduce((longest, current) => 
                                current.length > longest.length ? current : longest, '');
                        }).filter(text => text.trim().length > 10);
                    } else {
                        // Plain text file
                        texts = content.split(/\n\s*\n/).filter(t => t.trim().length > 10);
                        if (texts.length === 1) {
                            texts = content.split('\n').filter(t => t.trim().length > 10);
                        }
                    }

                    texts.forEach(text => {
                        const trimmed = text.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                        if (trimmed.length > 10) {
                            batchTexts.push({
                                id: Date.now() + Math.random(),
                                text: trimmed,
                                source: file.name
                            });
                        }
                    });

                    updateBatchQueue();
                    alert(`Successfully loaded ${texts.length} texts from ${file.name}`);
                } catch (error) {
                    alert('Error processing file. Please check the format and try again.');
                }
            };

            reader.readAsText(file);
        }

        function loadBatchSample(type) {
            const samples = batchSamples[type];
            samples.forEach(text => {
                batchTexts.push({
                    id: Date.now() + Math.random(),
                    text: text,
                    source: `${type} sample`
                });
            });
            updateBatchQueue();
        }

        function updateBatchQueue() {
            const queue = document.getElementById('batchQueue');
            const processBtn = document.getElementById('processBatchBtn');
            
            if (batchTexts.length === 0) {
                queue.innerHTML = `
                    <div class="text-center text-gray-500 py-8">
                        <div class="text-4xl mb-2">📝</div>
                        <p>No texts in batch queue</p>
                        <p class="text-sm">Add texts to start batch processing</p>
                    </div>
                `;
                processBtn.disabled = true;
                return;
            }

            processBtn.disabled = false;
            queue.innerHTML = batchTexts.map((item, index) => `
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        ${index + 1}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-800 truncate">${item.text}</p>
                        <p class="text-xs text-gray-500 mt-1">Source: ${item.source}</p>
                    </div>
                    <button onclick="removeBatchText('${item.id}')" 
                        class="flex-shrink-0 text-red-500 hover:text-red-700 text-sm">
                        ✕
                    </button>
                </div>
            `).join('');
        }

        function removeBatchText(id) {
            batchTexts = batchTexts.filter(item => item.id !== id);
            updateBatchQueue();
        }

        function clearBatch() {
            batchTexts = [];
            batchResults = [];
            updateBatchQueue();
            document.getElementById('batchResults').classList.add('hidden');
        }

        async function processBatch() {
            if (batchTexts.length === 0) return;

            const progressContainer = document.getElementById('batchProgress');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const processBtn = document.getElementById('processBatchBtn');

            // Show progress
            progressContainer.classList.remove('hidden');
            processBtn.disabled = true;
            processBtn.innerHTML = '⏳ Processing...';

            batchResults = [];
            
            for (let i = 0; i < batchTexts.length; i++) {
                const item = batchTexts[i];
                
                // Update progress
                const progress = ((i + 1) / batchTexts.length) * 100;
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${i + 1} / ${batchTexts.length}`;

                // Analyze text
                const result = performSentimentAnalysis(item.text);
                batchResults.push({
                    ...item,
                    ...result,
                    index: i
                });

                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Hide progress and show results
            progressContainer.classList.add('hidden');
            processBtn.disabled = false;
            processBtn.innerHTML = '🚀 Process Batch';
            
            displayBatchResults();
        }

        function displayBatchResults() {
            document.getElementById('batchResults').classList.remove('hidden');
            
            // Calculate aggregate statistics
            const totalTexts = batchResults.length;
            const avgPositive = Math.round(batchResults.reduce((sum, r) => sum + r.positivePercent, 0) / totalTexts);
            const avgNegative = Math.round(batchResults.reduce((sum, r) => sum + r.negativePercent, 0) / totalTexts);
            const avgConfidence = Math.round(batchResults.reduce((sum, r) => sum + r.confidence, 0) / totalTexts);

            // Update overview stats
            document.getElementById('totalProcessed').textContent = totalTexts;
            document.getElementById('avgPositive').textContent = `${avgPositive}%`;
            document.getElementById('avgNegative').textContent = `${avgNegative}%`;
            document.getElementById('avgConfidence').textContent = `${avgConfidence}%`;

            // Update charts
            updateBatchCharts();
            
            // Update insights
            updateBatchInsights();
            
            // Update individual results
            updateBatchResultsList();

            // Scroll to results
            document.getElementById('batchResults').scrollIntoView({ behavior: 'smooth' });
        }

        function updateBatchCharts() {
            // Sentiment distribution chart
            const sentimentCtx = document.getElementById('batchSentimentChart').getContext('2d');
            if (window.batchSentimentChart) window.batchSentimentChart.destroy();

            const avgPositive = batchResults.reduce((sum, r) => sum + r.positivePercent, 0) / batchResults.length;
            const avgNeutral = batchResults.reduce((sum, r) => sum + r.neutralPercent, 0) / batchResults.length;
            const avgNegative = batchResults.reduce((sum, r) => sum + r.negativePercent, 0) / batchResults.length;

            window.batchSentimentChart = new Chart(sentimentCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [{
                        data: [avgPositive, avgNeutral, avgNegative],
                        backgroundColor: ['#10B981', '#6B7280', '#EF4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { padding: 20, usePointStyle: true }
                        }
                    }
                }
            });

            // Confidence distribution chart
            const confidenceCtx = document.getElementById('batchConfidenceChart').getContext('2d');
            if (window.batchConfidenceChart) window.batchConfidenceChart.destroy();

            // Group confidence scores into ranges
            const confidenceRanges = { 'High (80-100%)': 0, 'Medium (60-79%)': 0, 'Low (40-59%)': 0, 'Very Low (0-39%)': 0 };
            batchResults.forEach(result => {
                if (result.confidence >= 80) confidenceRanges['High (80-100%)']++;
                else if (result.confidence >= 60) confidenceRanges['Medium (60-79%)']++;
                else if (result.confidence >= 40) confidenceRanges['Low (40-59%)']++;
                else confidenceRanges['Very Low (0-39%)']++;
            });

            window.batchConfidenceChart = new Chart(confidenceCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(confidenceRanges),
                    datasets: [{
                        label: 'Number of Texts',
                        data: Object.values(confidenceRanges),
                        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        }

        function updateBatchInsights() {
            const insights = document.getElementById('batchInsights');
            
            // Calculate insights
            const totalTexts = batchResults.length;
            const positiveTexts = batchResults.filter(r => r.overallSentiment.includes('Positive')).length;
            const negativeTexts = batchResults.filter(r => r.overallSentiment.includes('Negative')).length;
            const neutralTexts = totalTexts - positiveTexts - negativeTexts;
            
            const highConfidenceTexts = batchResults.filter(r => r.confidence >= 80).length;
            const avgWordCount = Math.round(batchResults.reduce((sum, r) => sum + r.wordCount, 0) / totalTexts);
            
            const mostPositive = batchResults.reduce((max, r) => r.positivePercent > max.positivePercent ? r : max);
            const mostNegative = batchResults.reduce((max, r) => r.negativePercent > max.negativePercent ? r : max);

            insights.innerHTML = `
                <div class="space-y-4">
                    <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 class="font-medium text-blue-800 mb-2">📊 Overall Distribution</h4>
                        <p class="text-sm text-blue-700">
                            ${positiveTexts} positive (${Math.round(positiveTexts/totalTexts*100)}%), 
                            ${neutralTexts} neutral (${Math.round(neutralTexts/totalTexts*100)}%), 
                            ${negativeTexts} negative (${Math.round(negativeTexts/totalTexts*100)}%) texts analyzed
                        </p>
                    </div>
                    
                    <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <h4 class="font-medium text-green-800 mb-2">🎯 Quality Metrics</h4>
                        <p class="text-sm text-green-700">
                            ${highConfidenceTexts} texts (${Math.round(highConfidenceTexts/totalTexts*100)}%) have high confidence scores (≥80%). 
                            Average text length: ${avgWordCount} words.
                        </p>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <h4 class="font-medium text-yellow-800 mb-2">⭐ Most Positive</h4>
                        <p class="text-sm text-yellow-700 mb-2">${mostPositive.positivePercent}% positive sentiment</p>
                        <p class="text-xs text-yellow-600 italic">"${mostPositive.text.substring(0, 100)}..."</p>
                    </div>
                    
                    <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <h4 class="font-medium text-red-800 mb-2">⚠️ Most Critical</h4>
                        <p class="text-sm text-red-700 mb-2">${mostNegative.negativePercent}% negative sentiment</p>
                        <p class="text-xs text-red-600 italic">"${mostNegative.text.substring(0, 100)}..."</p>
                    </div>
                </div>
            `;
        }

        function updateBatchResultsList() {
            const container = document.getElementById('batchResultsList');
            
            container.innerHTML = batchResults.map((result, index) => {
                const sentimentColor = result.overallSentiment.includes('Positive') ? 'text-green-600' : 
                                     result.overallSentiment.includes('Negative') ? 'text-red-600' : 'text-gray-600';
                const bgColor = result.overallSentiment.includes('Positive') ? 'bg-green-50 border-green-200' : 
                               result.overallSentiment.includes('Negative') ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';

                return `
                    <div class="border rounded-lg p-4 ${bgColor}">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">${result.sentimentEmoji}</span>
                                <div>
                                    <h4 class="font-medium ${sentimentColor}">${result.overallSentiment}</h4>
                                    <p class="text-sm text-gray-600">Confidence: ${result.confidence}% • ${result.wordCount} words</p>
                                </div>
                            </div>
                            <div class="text-right text-sm">
                                <div class="text-green-600">+${result.positivePercent}%</div>
                                <div class="text-gray-600">=${result.neutralPercent}%</div>
                                <div class="text-red-600">-${result.negativePercent}%</div>
                            </div>
                        </div>
                        
                        <p class="text-gray-800 text-sm mb-3">${result.text}</p>
                        
                        <div class="flex items-center justify-between text-xs text-gray-500">
                            <span>Source: ${result.source}</span>
                            <span>Intensity: ${result.intensity}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function sortBatchResults() {
            const sortBy = document.getElementById('sortBy').value;
            
            switch (sortBy) {
                case 'confidence':
                    batchResults.sort((a, b) => b.confidence - a.confidence);
                    break;
                case 'positive':
                    batchResults.sort((a, b) => b.positivePercent - a.positivePercent);
                    break;
                case 'negative':
                    batchResults.sort((a, b) => b.negativePercent - a.negativePercent);
                    break;
                case 'length':
                    batchResults.sort((a, b) => b.wordCount - a.wordCount);
                    break;
                default: // index
                    batchResults.sort((a, b) => a.index - b.index);
            }
            
            updateBatchResultsList();
        }

        function exportBatchResults() {
            const csvContent = [
                ['Index', 'Text', 'Overall Sentiment', 'Confidence', 'Positive %', 'Neutral %', 'Negative %', 'Word Count', 'Intensity', 'Source'].join(','),
                ...batchResults.map(result => [
                    result.index + 1,
                    `"${result.text.replace(/"/g, '""')}"`,
                    result.overallSentiment,
                    result.confidence,
                    result.positivePercent,
                    result.neutralPercent,
                    result.negativePercent,
                    result.wordCount,
                    result.intensity,
                    result.source
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sentiment_analysis_batch_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        // Single analysis functions (keeping existing functionality)
        function loadTemplate(type) {
            document.getElementById('textInput').value = templates[type];
        }

        function loadSample() {
            loadTemplate('review');
        }

        function clearAll() {
            document.getElementById('textInput').value = '';
            document.getElementById('fileInput').value = '';
            document.getElementById('fileInfo').classList.add('hidden');
            document.getElementById('resultsSection').classList.add('hidden');
            document.getElementById('exportOptions').classList.add('hidden');
            currentAnalysisResult = null;
        }

        // Export Functions
        function exportResults(format) {
            if (!currentAnalysisResult) {
                alert('No analysis results to export. Please analyze some text first.');
                return;
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const originalText = document.getElementById('textInput').value;
            
            switch (format) {
                case 'csv':
                    exportToCSV(currentAnalysisResult, originalText, timestamp);
                    break;
                case 'json':
                    exportToJSON(currentAnalysisResult, originalText, timestamp);
                    break;
                case 'pdf':
                    exportToPDF(currentAnalysisResult, originalText, timestamp);
                    break;
                default:
                    alert('Unsupported export format');
            }
        }

        function exportToCSV(data, originalText, timestamp) {
            const csvRows = [
                ['Metric', 'Value', 'Description'],
                ['Analysis Date', timestamp, 'Date of sentiment analysis'],
                ['Text Length', data.wordCount + ' words', 'Number of words analyzed'],
                ['Sentences', data.sentenceCount, 'Number of sentences'],
                ['Overall Sentiment', data.overallSentiment, 'Primary sentiment classification'],
                ['Sentiment Score', data.avgSentiment, 'Numerical sentiment score (-1 to +1)'],
                ['Confidence Level', data.confidence + '%', 'Overall confidence in classification'],
                ['Positive Percentage', data.positivePercent + '%', 'Percentage of positive sentiment'],
                ['Neutral Percentage', data.neutralPercent + '%', 'Percentage of neutral sentiment'],
                ['Negative Percentage', data.negativePercent + '%', 'Percentage of negative sentiment'],
                ['Emotional Intensity', data.intensity, 'Level of emotional expression'],
                ['Sentiment Density', data.sentimentDensity + '%', 'Percentage of words with sentiment'],
                ['Word Coverage', data.wordCoverage + '%', 'Percentage of sentiment words identified'],
                ['Consistency Score', data.consistencyScore, 'Sentiment consistency across text'],
                ['Positive Confidence', data.positiveConfidence + '%', 'Confidence in positive classification'],
                ['Negative Confidence', data.negativeConfidence + '%', 'Confidence in negative classification'],
                ['Neutral Confidence', data.neutralConfidence + '%', 'Confidence in neutral classification'],
                ['', '', ''],
                ['Positive Keywords', data.foundPositiveWords.join(', '), 'Words contributing to positive sentiment'],
                ['Negative Keywords', data.foundNegativeWords.join(', '), 'Words contributing to negative sentiment'],
                ['Neutral Keywords', data.foundNeutralWords.slice(0, 10).join(', '), 'Neutral/factual words identified'],
                ['', '', ''],
                ['Original Text', '"' + originalText.replace(/"/g, '""') + '"', 'The analyzed text content']
            ];

            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            downloadFile(csvContent, `sentiment_analysis_${timestamp}.csv`, 'text/csv');
        }

        function exportToJSON(data, originalText, timestamp) {
            const exportData = {
                metadata: {
                    analysisDate: timestamp,
                    analysisTime: new Date().toISOString(),
                    textLength: data.wordCount,
                    sentences: data.sentenceCount,
                    analysisVersion: '2.0'
                },
                originalText: originalText,
                sentimentAnalysis: {
                    overallSentiment: data.overallSentiment,
                    sentimentScore: parseFloat(data.avgSentiment),
                    sentimentMagnitude: data.sentimentMagnitude,
                    confidence: {
                        overall: data.confidence,
                        positive: data.positiveConfidence,
                        negative: data.negativeConfidence,
                        neutral: data.neutralConfidence
                    },
                    distribution: {
                        positive: data.positivePercent,
                        neutral: data.neutralPercent,
                        negative: data.negativePercent
                    },
                    metrics: {
                        emotionalIntensity: data.intensity,
                        sentimentDensity: data.sentimentDensity,
                        wordCoverage: data.wordCoverage,
                        consistencyScore: parseFloat(data.consistencyScore)
                    }
                },
                keywordAnalysis: {
                    positiveKeywords: data.foundPositiveWords,
                    negativeKeywords: data.foundNegativeWords,
                    neutralKeywords: data.foundNeutralWords.slice(0, 15)
                },
                sentenceBreakdown: data.sentences.map((sentence, index) => ({
                    index: index + 1,
                    text: sentence.trim(),
                    length: sentence.trim().split(' ').length
                })),
                qualityMetrics: {
                    textQuality: data.wordCount >= 50 ? 'High' : data.wordCount >= 20 ? 'Medium' : 'Low',
                    reliabilityScore: Math.min(100, (data.confidence + data.sentimentDensity + (data.consistencyScore * 100)) / 3),
                    recommendedActions: generateRecommendations(data)
                }
            };

            const jsonContent = JSON.stringify(exportData, null, 2);
            downloadFile(jsonContent, `sentiment_analysis_${timestamp}.json`, 'application/json');
        }

        function exportToPDF(data, originalText, timestamp) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let yPosition = 20;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const lineHeight = 7;

            // Helper function to add text with word wrapping
            function addText(text, x, y, maxWidth = 170, fontSize = 12) {
                doc.setFontSize(fontSize);
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, x, y);
                return y + (lines.length * lineHeight);
            }

            // Helper function to check if we need a new page
            function checkNewPage(requiredSpace = 30) {
                if (yPosition + requiredSpace > pageHeight - margin) {
                    doc.addPage();
                    yPosition = 20;
                }
            }

            // Title
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text('Sentiment Analysis Report', margin, yPosition);
            yPosition += 15;

            // Analysis metadata
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            yPosition = addText(`Analysis Date: ${timestamp}`, margin, yPosition);
            yPosition = addText(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
            yPosition += 10;

            // Overall Results Section
            checkNewPage();
            doc.setFont(undefined, 'bold');
            yPosition = addText('OVERALL SENTIMENT ANALYSIS', margin, yPosition, 170, 14);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            yPosition = addText(`Overall Sentiment: ${data.overallSentiment}`, margin, yPosition);
            yPosition = addText(`Confidence Level: ${data.confidence}%`, margin, yPosition);
            yPosition = addText(`Sentiment Score: ${data.avgSentiment} (Range: -1 to +1)`, margin, yPosition);
            yPosition = addText(`Emotional Intensity: ${data.intensity}`, margin, yPosition);
            yPosition += 10;

            // Sentiment Distribution
            checkNewPage();
            doc.setFont(undefined, 'bold');
            yPosition = addText('SENTIMENT DISTRIBUTION', margin, yPosition, 170, 14);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            yPosition = addText(`Positive: ${data.positivePercent}%`, margin, yPosition);
            yPosition = addText(`Neutral: ${data.neutralPercent}%`, margin, yPosition);
            yPosition = addText(`Negative: ${data.negativePercent}%`, margin, yPosition);
            yPosition += 10;

            // Confidence Breakdown
            checkNewPage();
            doc.setFont(undefined, 'bold');
            yPosition = addText('CONFIDENCE BREAKDOWN', margin, yPosition, 170, 14);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            yPosition = addText(`Positive Classification Confidence: ${data.positiveConfidence}%`, margin, yPosition);
            yPosition = addText(`Negative Classification Confidence: ${data.negativeConfidence}%`, margin, yPosition);
            yPosition = addText(`Neutral Classification Confidence: ${data.neutralConfidence}%`, margin, yPosition);
            yPosition += 10;

            // Quality Metrics
            checkNewPage();
            doc.setFont(undefined, 'bold');
            yPosition = addText('QUALITY METRICS', margin, yPosition, 170, 14);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            yPosition = addText(`Text Length: ${data.wordCount} words, ${data.sentenceCount} sentences`, margin, yPosition);
            yPosition = addText(`Sentiment Density: ${data.sentimentDensity}% (emotional words per total words)`, margin, yPosition);
            yPosition = addText(`Word Coverage: ${data.wordCoverage}% (sentiment words identified)`, margin, yPosition);
            yPosition = addText(`Consistency Score: ${data.consistencyScore} (sentiment uniformity)`, margin, yPosition);
            yPosition += 10;

            // Keyword Analysis
            checkNewPage(50);
            doc.setFont(undefined, 'bold');
            yPosition = addText('KEYWORD ANALYSIS', margin, yPosition, 170, 14);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            if (data.foundPositiveWords.length > 0) {
                yPosition = addText(`Positive Keywords: ${data.foundPositiveWords.join(', ')}`, margin, yPosition);
                yPosition += 5;
            }
            if (data.foundNegativeWords.length > 0) {
                yPosition = addText(`Negative Keywords: ${data.foundNegativeWords.join(', ')}`, margin, yPosition);
                yPosition += 5;
            }
            if (data.foundNeutralWords.length > 0) {
                yPosition = addText(`Key Neutral Terms: ${data.foundNeutralWords.slice(0, 10).join(', ')}`, margin, yPosition);
                yPosition += 5;
            }
            yPosition += 10;

            // Recommendations
            checkNewPage(40);
            doc.setFont(undefined, 'bold');
            yPosition = addText('RECOMMENDATIONS & INSIGHTS', margin, yPosition, 170, 14);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            const recommendations = generateRecommendations(data);
            recommendations.forEach(rec => {
                checkNewPage(15);
                yPosition = addText(`• ${rec}`, margin, yPosition);
                yPosition += 3;
            });
            yPosition += 10;

            // Original Text
            checkNewPage(60);
            doc.setFont(undefined, 'bold');
            yPosition = addText('ANALYZED TEXT', margin, yPosition, 170, 14);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            const textLines = doc.splitTextToSize(originalText, 170);
            
            textLines.forEach(line => {
                checkNewPage(10);
                doc.text(line, margin, yPosition);
                yPosition += 5;
            });

            // Footer
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont(undefined, 'normal');
                doc.text(`Page ${i} of ${totalPages} | Sentiment Analysis Report | Generated ${timestamp}`, 
                    margin, pageHeight - 10);
            }

            doc.save(`sentiment_analysis_report_${timestamp}.pdf`);
        }

        function generateRecommendations(data) {
            const recommendations = [];
            
            if (data.confidence < 70) {
                recommendations.push('Consider analyzing a longer text sample for more reliable results');
            }
            
            if (data.sentimentDensity < 15) {
                recommendations.push('Text appears factual/neutral - consider context when interpreting sentiment');
            }
            
            if (data.consistencyScore < 0.6) {
                recommendations.push('Mixed sentiment detected - analyze individual sections for nuanced insights');
            }
            
            if (data.wordCount < 30) {
                recommendations.push('Short text sample may limit accuracy - combine with additional content if possible');
            }
            
            if (data.overallSentiment.includes('Positive') && data.negativePercent > 25) {
                recommendations.push('Despite positive classification, significant negative elements present - review for balanced perspective');
            }
            
            if (data.overallSentiment.includes('Negative') && data.positivePercent > 25) {
                recommendations.push('Negative sentiment with positive elements suggests constructive feedback rather than pure criticism');
            }
            
            if (data.confidence >= 85 && data.sentimentDensity >= 20) {
                recommendations.push('High-quality analysis with strong sentiment signals - results are highly reliable');
            }
            
            return recommendations;
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

        function switchInputMethod(method) {
            const textSection = document.getElementById('textInputSection');
            const fileSection = document.getElementById('fileInputSection');
            const textBtn = document.getElementById('textMethodBtn');
            const fileBtn = document.getElementById('fileMethodBtn');

            if (method === 'text') {
                textSection.classList.remove('hidden');
                fileSection.classList.add('hidden');
                textBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors';
                fileBtn.className = 'px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-400';
            } else {
                textSection.classList.add('hidden');
                fileSection.classList.remove('hidden');
                fileBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors';
                textBtn.className = 'px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-400';
            }
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const fileInfo = document.getElementById('fileInfo');
            const fileName = document.getElementById('fileName');
            const fileSize = document.getElementById('fileSize');

            fileName.textContent = file.name;
            fileSize.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
            fileInfo.classList.remove('hidden');

            const reader = new FileReader();
            reader.onload = function(e) {
                let content = e.target.result;
                
                // Handle different file types
                if (file.name.endsWith('.json')) {
                    try {
                        const jsonData = JSON.parse(content);
                        // Extract text from common JSON structures
                        if (jsonData.text) content = jsonData.text;
                        else if (jsonData.content) content = jsonData.content;
                        else if (jsonData.message) content = jsonData.message;
                        else if (Array.isArray(jsonData)) {
                            content = jsonData.map(item => 
                                item.text || item.content || item.message || JSON.stringify(item)
                            ).join(' ');
                        } else {
                            content = JSON.stringify(jsonData, null, 2);
                        }
                    } catch (error) {
                        alert('Error parsing JSON file. Please check the file format.');
                        return;
                    }
                } else if (file.name.endsWith('.csv')) {
                    // Simple CSV parsing - extract text from all cells
                    const lines = content.split('\n');
                    content = lines.map(line => line.split(',').join(' ')).join(' ');
                }

                // Set the content to the text input for processing
                document.getElementById('textInput').value = content;
                
                // Show success message
                setTimeout(() => {
                    fileInfo.innerHTML = `
                        <div class="flex items-center gap-2">
                            <span class="text-green-600">✅</span>
                            <span class="font-medium text-green-800">File loaded successfully!</span>
                            <span class="text-sm text-green-600">${(content.length)} characters</span>
                        </div>
                    `;
                }, 500);
            };

            reader.onerror = function() {
                alert('Error reading file. Please try again.');
            };

            reader.readAsText(file);
        }

        // Add drag and drop functionality
        document.addEventListener('DOMContentLoaded', function() {
            const fileSection = document.getElementById('fileInputSection');
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                fileSection.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                fileSection.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                fileSection.addEventListener(eventName, unhighlight, false);
            });

            function highlight(e) {
                fileSection.querySelector('.border-dashed').classList.add('border-blue-400', 'bg-blue-50');
            }

            function unhighlight(e) {
                fileSection.querySelector('.border-dashed').classList.remove('border-blue-400', 'bg-blue-50');
            }

            fileSection.addEventListener('drop', handleDrop, false);

            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length > 0) {
                    document.getElementById('fileInput').files = files;
                    handleFileUpload({ target: { files: files } });
                }
            }
        });

        function analyzeSentiment() {
            const text = document.getElementById('textInput').value.trim();
            if (!text) {
                alert('Please enter some text to analyze!');
                return;
            }

            // Show loading state
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '🔄 Analyzing...';
            button.disabled = true;

            // Simulate analysis delay
            setTimeout(() => {
                const result = performSentimentAnalysis(text);
                currentAnalysisResult = result;
                updateResults(result);
                button.innerHTML = originalText;
                button.disabled = false;
                document.getElementById('resultsSection').classList.remove('hidden');
                document.getElementById('exportOptions').classList.remove('hidden');
                document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
            }, 1500);
        }

        function performSentimentAnalysis(text) {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const words = text.toLowerCase().match(/\b\w+\b/g) || [];
            
            let positiveScore = 0;
            let negativeScore = 0;
            let neutralScore = 0;
            let totalWords = words.length;

            const foundPositiveWords = [];
            const foundNegativeWords = [];
            const foundNeutralWords = [];
            
            // Advanced sentiment scoring with intensity levels
            const sentimentScores = [];

            // Analyze words with context and modifiers
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const prevWord = i > 0 ? words[i - 1] : '';
                const nextWord = i < words.length - 1 ? words[i + 1] : '';
                
                let wordScore = 0;
                let wordIntensity = 1;
                let isNegated = false;

                // Check for negation in previous 2 words
                for (let j = Math.max(0, i - 2); j < i; j++) {
                    if (sentimentModifiers.negators.includes(words[j])) {
                        isNegated = true;
                        break;
                    }
                }

                // Check for intensifiers/diminishers
                if (sentimentModifiers.intensifiers.includes(prevWord)) {
                    wordIntensity = 1.5;
                } else if (sentimentModifiers.diminishers.includes(prevWord)) {
                    wordIntensity = 0.7;
                }

                // Classify word sentiment with intensity
                if (sentimentWords.positive.strong.includes(word)) {
                    wordScore = 3 * wordIntensity;
                    if (!foundPositiveWords.includes(word)) foundPositiveWords.push(word);
                } else if (sentimentWords.positive.moderate.includes(word)) {
                    wordScore = 2 * wordIntensity;
                    if (!foundPositiveWords.includes(word)) foundPositiveWords.push(word);
                } else if (sentimentWords.positive.mild.includes(word)) {
                    wordScore = 1 * wordIntensity;
                    if (!foundPositiveWords.includes(word)) foundPositiveWords.push(word);
                } else if (sentimentWords.negative.strong.includes(word)) {
                    wordScore = -3 * wordIntensity;
                    if (!foundNegativeWords.includes(word)) foundNegativeWords.push(word);
                } else if (sentimentWords.negative.moderate.includes(word)) {
                    wordScore = -2 * wordIntensity;
                    if (!foundNegativeWords.includes(word)) foundNegativeWords.push(word);
                } else if (sentimentWords.negative.mild.includes(word)) {
                    wordScore = -1 * wordIntensity;
                    if (!foundNegativeWords.includes(word)) foundNegativeWords.push(word);
                } else if (sentimentWords.neutral.factual.includes(word) || 
                          sentimentWords.neutral.descriptive.includes(word) || 
                          sentimentWords.neutral.transitional.includes(word)) {
                    wordScore = 0;
                    if (word.length > 3 && !foundNeutralWords.includes(word)) {
                        foundNeutralWords.push(word);
                    }
                } else if (word.length > 3 && !foundNeutralWords.includes(word)) {
                    foundNeutralWords.push(word);
                }

                // Apply negation
                if (isNegated && wordScore !== 0) {
                    wordScore = -wordScore * 0.8; // Negation reduces intensity slightly
                }

                sentimentScores.push(wordScore);
                
                if (wordScore > 0) positiveScore += wordScore;
                else if (wordScore < 0) negativeScore += Math.abs(wordScore);
                else neutralScore += 1;
            }

            // Calculate advanced metrics
            const totalSentimentScore = positiveScore + negativeScore;
            const rawPositivePercent = totalSentimentScore > 0 ? (positiveScore / totalSentimentScore) * 100 : 33;
            const rawNegativePercent = totalSentimentScore > 0 ? (negativeScore / totalSentimentScore) * 100 : 33;
            
            // Normalize percentages including neutral content
            const totalClassifiedWords = positiveScore + negativeScore + neutralScore;
            const positivePercent = Math.round((positiveScore / totalClassifiedWords) * 100);
            const negativePercent = Math.round((negativeScore / totalClassifiedWords) * 100);
            const neutralPercent = Math.round((neutralScore / totalClassifiedWords) * 100);

            // Advanced overall sentiment classification
            const overallSentimentScore = (positiveScore - negativeScore) / totalWords;
            const sentimentMagnitude = Math.abs(overallSentimentScore);
            
            let overallSentiment, sentimentEmoji, sentimentColor, confidenceLevel;
            
            if (overallSentimentScore > 0.05) {
                if (overallSentimentScore > 0.15) {
                    overallSentiment = 'Very Positive';
                    sentimentEmoji = '🤩';
                } else if (overallSentimentScore > 0.08) {
                    overallSentiment = 'Positive';
                    sentimentEmoji = '😊';
                } else {
                    overallSentiment = 'Slightly Positive';
                    sentimentEmoji = '🙂';
                }
                sentimentColor = 'text-green-600';
            } else if (overallSentimentScore < -0.05) {
                if (overallSentimentScore < -0.15) {
                    overallSentiment = 'Very Negative';
                    sentimentEmoji = '😡';
                } else if (overallSentimentScore < -0.08) {
                    overallSentiment = 'Negative';
                    sentimentEmoji = '😞';
                } else {
                    overallSentiment = 'Slightly Negative';
                    sentimentEmoji = '😕';
                }
                sentimentColor = 'text-red-600';
            } else {
                if (Math.abs(overallSentimentScore) < 0.02) {
                    overallSentiment = 'Neutral';
                    sentimentEmoji = '😐';
                } else {
                    overallSentiment = 'Mixed';
                    sentimentEmoji = '🤔';
                }
                sentimentColor = 'text-gray-600';
            }

            // Advanced confidence scoring system
            const sentimentWordDensity = (positiveScore + negativeScore) / totalWords;
            const sentimentConsistency = 1 - (Math.min(positiveScore, negativeScore) / Math.max(positiveScore, negativeScore, 1));
            const wordCoverage = (foundPositiveWords.length + foundNegativeWords.length) / totalWords;
            
            // Calculate individual confidence scores for each class
            const positiveConfidence = Math.min(95, Math.max(30, 
                (positiveScore / Math.max(positiveScore + negativeScore, 1)) * 100 + 
                (foundPositiveWords.length / Math.max(totalWords * 0.1, 1)) * 50 +
                (sentimentMagnitude > 0 ? sentimentMagnitude * 200 : 0)
            ));
            
            const negativeConfidence = Math.min(95, Math.max(30,
                (negativeScore / Math.max(positiveScore + negativeScore, 1)) * 100 + 
                (foundNegativeWords.length / Math.max(totalWords * 0.1, 1)) * 50 +
                (sentimentMagnitude > 0 && overallSentimentScore < 0 ? sentimentMagnitude * 200 : 0)
            ));
            
            const neutralConfidence = Math.min(95, Math.max(40,
                (neutralScore / totalWords) * 100 +
                (Math.abs(overallSentimentScore) < 0.05 ? 40 : 0) +
                (sentimentWordDensity < 0.1 ? 30 : 0)
            ));
            
            // Overall confidence based on multiple factors
            confidenceLevel = Math.min(95, Math.max(50, 
                (sentimentWordDensity * 150) + 
                (sentimentConsistency * 25) + 
                (sentimentMagnitude * 100) +
                (wordCoverage * 50) +
                (sentences.length > 3 ? 10 : 0) // Bonus for longer texts
            ));

            // Determine intensity level
            let intensity;
            if (sentimentMagnitude > 0.12) intensity = 'Very High';
            else if (sentimentMagnitude > 0.08) intensity = 'High';
            else if (sentimentMagnitude > 0.04) intensity = 'Medium';
            else if (sentimentMagnitude > 0.02) intensity = 'Low';
            else intensity = 'Very Low';

            return {
                overallSentiment,
                sentimentEmoji,
                sentimentColor,
                positivePercent,
                negativePercent,
                neutralPercent,
                wordCount: totalWords,
                sentenceCount: sentences.length,
                avgSentiment: overallSentimentScore.toFixed(3),
                intensity,
                confidence: Math.round(confidenceLevel),
                positiveConfidence: Math.round(positiveConfidence),
                negativeConfidence: Math.round(negativeConfidence),
                neutralConfidence: Math.round(neutralConfidence),
                sentimentDensity: Math.round(sentimentWordDensity * 100),
                wordCoverage: Math.round(wordCoverage * 100),
                consistencyScore: sentimentConsistency.toFixed(2),
                foundPositiveWords: foundPositiveWords.slice(0, 12),
                foundNegativeWords: foundNegativeWords.slice(0, 12),
                foundNeutralWords: foundNeutralWords.slice(0, 15),
                sentences,
                sentimentScore: overallSentimentScore,
                sentimentMagnitude,
                positiveScore,
                negativeScore,
                neutralScore
            };
        }

        function toggleKeywordView(view) {
            currentKeywordView = view;
            
            // Update button states
            const impactBtn = document.getElementById('impactViewBtn');
            const frequencyBtn = document.getElementById('frequencyViewBtn');
            
            if (view === 'impact') {
                impactBtn.className = 'px-3 py-1 bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors';
                frequencyBtn.className = 'px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg font-medium transition-colors hover:bg-gray-400';
            } else {
                frequencyBtn.className = 'px-3 py-1 bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors';
                impactBtn.className = 'px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg font-medium transition-colors hover:bg-gray-400';
            }
            
            // Refresh keyword display
            if (keywordAnalysisData.originalText) {
                updateKeywordAnalysis(keywordAnalysisData);
            }
        }

        function updateResults(data) {
            // Update overall sentiment
            document.getElementById('overallSentiment').textContent = data.sentimentEmoji;
            document.getElementById('sentimentLabel').textContent = data.overallSentiment;
            document.getElementById('sentimentLabel').className = `text-2xl font-bold ${data.sentimentColor}`;
            document.getElementById('confidenceScore').textContent = `Confidence: ${data.confidence}%`;

            // Update percentages and bars
            document.getElementById('positivePercent').textContent = `${data.positivePercent}%`;
            document.getElementById('positiveBar').style.width = `${data.positivePercent}%`;
            document.getElementById('neutralPercent').textContent = `${data.neutralPercent}%`;
            document.getElementById('neutralBar').style.width = `${data.neutralPercent}%`;
            document.getElementById('negativePercent').textContent = `${data.negativePercent}%`;
            document.getElementById('negativeBar').style.width = `${data.negativePercent}%`;

            // Update metrics
            document.getElementById('wordCount').textContent = data.wordCount;
            document.getElementById('sentenceCount').textContent = data.sentenceCount;
            document.getElementById('avgSentiment').textContent = data.avgSentiment;
            document.getElementById('intensity').textContent = data.intensity;

            // Update confidence scores
            document.getElementById('overallConfidence').textContent = `${data.confidence}%`;
            document.getElementById('overallConfidenceBar').style.width = `${data.confidence}%`;
            document.getElementById('positiveConfidence').textContent = `${data.positiveConfidence}%`;
            document.getElementById('positiveConfidenceBar').style.width = `${data.positiveConfidence}%`;
            document.getElementById('negativeConfidence').textContent = `${data.negativeConfidence}%`;
            document.getElementById('negativeConfidenceBar').style.width = `${data.negativeConfidence}%`;
            document.getElementById('neutralConfidence').textContent = `${data.neutralConfidence}%`;
            document.getElementById('neutralConfidenceBar').style.width = `${data.neutralConfidence}%`;
            
            // Update confidence metrics
            document.getElementById('sentimentDensity').textContent = `${data.sentimentDensity}%`;
            document.getElementById('wordCoverage').textContent = `${data.wordCoverage}%`;
            document.getElementById('consistencyScore').textContent = data.consistencyScore;

            // Update detailed explanations
            updateSentimentExplanation(data);

            // Update keyword analysis
            updateKeywordAnalysis(data);

            // Update insights
            updateInsights(data);

            // Update sentence analysis
            updateSentenceAnalysis(data.sentences, data.sentimentScore);

            // Update chart
            updateChart(data.positivePercent, data.neutralPercent, data.negativePercent);
        }

        function updateSentimentExplanation(data) {
            const originalText = document.getElementById('textInput').value;
            
            // Update score breakdown
            updateScoreBreakdown(data);
            
            // Update classification logic
            updateClassificationLogic(data);
            
            // Update key factors
            updateKeyFactors(data);
            
            // Update word-by-word analysis
            updateWordByWordAnalysis(originalText, data);
            
            // Update confidence explanation
            updateConfidenceExplanation(data);
            
            // Update alternative interpretations
            updateAlternativeInterpretations(data);
        }

        function updateScoreBreakdown(data) {
            const container = document.getElementById('scoreBreakdown');
            
            const breakdown = [
                { label: 'Positive Word Score', value: data.positiveScore.toFixed(2), color: 'text-green-600' },
                { label: 'Negative Word Score', value: data.negativeScore.toFixed(2), color: 'text-red-600' },
                { label: 'Neutral Word Score', value: data.neutralScore.toFixed(2), color: 'text-gray-600' },
                { label: 'Total Words Analyzed', value: data.wordCount, color: 'text-blue-600' },
                { label: 'Final Sentiment Score', value: data.avgSentiment, color: 'text-purple-600' },
                { label: 'Sentiment Magnitude', value: data.sentimentMagnitude.toFixed(3), color: 'text-orange-600' }
            ];
            
            container.innerHTML = breakdown.map(item => `
                <div class="flex justify-between items-center">
                    <span class="text-gray-700">${item.label}:</span>
                    <span class="font-semibold ${item.color}">${item.value}</span>
                </div>
            `).join('');
        }

        function updateClassificationLogic(data) {
            const container = document.getElementById('classificationLogic');
            
            const logic = [];
            
            // Explain the classification decision
            if (data.sentimentScore > 0.05) {
                logic.push(`✅ Sentiment score (${data.avgSentiment}) > 0.05 → Positive classification`);
                if (data.sentimentScore > 0.15) {
                    logic.push(`⭐ Score > 0.15 → Upgraded to "Very Positive"`);
                } else if (data.sentimentScore > 0.08) {
                    logic.push(`📈 Score > 0.08 → Classified as "Positive"`);
                } else {
                    logic.push(`📊 Score 0.05-0.08 → Classified as "Slightly Positive"`);
                }
            } else if (data.sentimentScore < -0.05) {
                logic.push(`❌ Sentiment score (${data.avgSentiment}) < -0.05 → Negative classification`);
                if (data.sentimentScore < -0.15) {
                    logic.push(`⚠️ Score < -0.15 → Upgraded to "Very Negative"`);
                } else if (data.sentimentScore < -0.08) {
                    logic.push(`📉 Score < -0.08 → Classified as "Negative"`);
                } else {
                    logic.push(`📊 Score -0.08 to -0.05 → Classified as "Slightly Negative"`);
                }
            } else {
                logic.push(`⚖️ Sentiment score (${data.avgSentiment}) between -0.05 and 0.05 → Neutral/Mixed`);
                if (Math.abs(data.sentimentScore) < 0.02) {
                    logic.push(`🎯 |Score| < 0.02 → Pure "Neutral" classification`);
                } else {
                    logic.push(`🤔 Slight bias detected → "Mixed" classification`);
                }
            }
            
            logic.push(`🎯 Confidence calculated from word density (${data.sentimentDensity}%) + consistency (${data.consistencyScore})`);
            
            container.innerHTML = logic.map(item => `
                <div class="text-gray-700">${item}</div>
            `).join('');
        }

        function updateKeyFactors(data) {
            const container = document.getElementById('keyFactors');
            
            const factors = [];
            
            // Determine key factors based on the analysis
            if (data.sentimentDensity >= 20) {
                factors.push({
                    icon: '💪',
                    title: 'High Emotional Density',
                    description: `${data.sentimentDensity}% of words carry emotional weight`,
                    impact: 'Strong',
                    color: 'bg-green-50 border-green-200 text-green-800'
                });
            } else if (data.sentimentDensity <= 10) {
                factors.push({
                    icon: '📋',
                    title: 'Low Emotional Content',
                    description: `Only ${data.sentimentDensity}% emotional words detected`,
                    impact: 'Moderate',
                    color: 'bg-blue-50 border-blue-200 text-blue-800'
                });
            }
            
            if (data.consistencyScore >= 0.7) {
                factors.push({
                    icon: '🎯',
                    title: 'Consistent Sentiment',
                    description: `${(data.consistencyScore * 100).toFixed(0)}% consistency across text`,
                    impact: 'Strong',
                    color: 'bg-green-50 border-green-200 text-green-800'
                });
            } else if (data.consistencyScore <= 0.4) {
                factors.push({
                    icon: '🌊',
                    title: 'Mixed Signals',
                    description: `${(data.consistencyScore * 100).toFixed(0)}% consistency - conflicting sentiments`,
                    impact: 'Moderate',
                    color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
                });
            }
            
            if (data.wordCount >= 50) {
                factors.push({
                    icon: '📚',
                    title: 'Comprehensive Text',
                    description: `${data.wordCount} words provide reliable analysis`,
                    impact: 'Strong',
                    color: 'bg-green-50 border-green-200 text-green-800'
                });
            } else if (data.wordCount <= 20) {
                factors.push({
                    icon: '⚠️',
                    title: 'Limited Text Sample',
                    description: `Only ${data.wordCount} words - may affect accuracy`,
                    impact: 'Weak',
                    color: 'bg-red-50 border-red-200 text-red-800'
                });
            }
            
            // Add more factors if needed
            if (factors.length < 3) {
                if (data.sentimentMagnitude > 0.1) {
                    factors.push({
                        icon: '⚡',
                        title: 'Strong Sentiment Signal',
                        description: `High magnitude (${data.sentimentMagnitude.toFixed(3)}) indicates clear sentiment`,
                        impact: 'Strong',
                        color: 'bg-purple-50 border-purple-200 text-purple-800'
                    });
                }
            }
            
            container.innerHTML = factors.map(factor => `
                <div class="p-3 rounded-lg border ${factor.color}">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-lg">${factor.icon}</span>
                        <span class="font-medium">${factor.title}</span>
                    </div>
                    <p class="text-sm mb-2">${factor.description}</p>
                    <span class="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                        ${factor.impact} Impact
                    </span>
                </div>
            `).join('');
        }

        function updateWordByWordAnalysis(originalText, data) {
            const container = document.getElementById('wordByWordAnalysis');
            const words = originalText.split(/(\s+)/); // Preserve whitespace
            
            let analysisHtml = '';
            let wordIndex = 0;
            
            words.forEach((word, index) => {
                const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
                
                if (cleanWord.length > 0) {
                    const wordData = analyzeWordContribution(cleanWord, wordIndex, originalText.toLowerCase().match(/\b\w+\b/g) || []);
                    
                    let className = 'cursor-pointer hover:bg-gray-200 px-1 rounded transition-colors';
                    let title = `Click for details: ${wordData.explanation}`;
                    
                    if (wordData.impact > 0) {
                        className += wordData.impact >= 2 ? ' bg-green-200 text-green-900' : ' bg-green-100 text-green-800';
                    } else if (wordData.impact < 0) {
                        className += Math.abs(wordData.impact) >= 2 ? ' bg-red-200 text-red-900' : ' bg-red-100 text-red-800';
                    } else if (wordData.isModifier) {
                        className += ' bg-blue-100 text-blue-800';
                    }
                    
                    analysisHtml += `<span class="${className}" title="${title}" onclick="showWordDetails('${cleanWord}', ${wordData.impact}, '${wordData.explanation.replace(/'/g, '\\\'')}')">${word}</span>`;
                    wordIndex++;
                } else {
                    analysisHtml += word;
                }
            });
            
            container.innerHTML = analysisHtml;
        }

        function analyzeWordContribution(word, index, allWords) {
            let impact = 0;
            let explanation = '';
            let isModifier = false;
            let wordIntensity = 1;
            let isNegated = false;
            
            // Check for negation in previous words
            for (let j = Math.max(0, index - 2); j < index; j++) {
                if (sentimentModifiers.negators.includes(allWords[j])) {
                    isNegated = true;
                    break;
                }
            }
            
            // Check for intensifiers/diminishers
            const prevWord = index > 0 ? allWords[index - 1] : '';
            if (sentimentModifiers.intensifiers.includes(prevWord)) {
                wordIntensity = 1.5;
            } else if (sentimentModifiers.diminishers.includes(prevWord)) {
                wordIntensity = 0.7;
            }
            
            // Analyze word sentiment
            if (sentimentWords.positive.strong.includes(word)) {
                impact = 3 * wordIntensity;
                explanation = `Strong positive word (+${impact.toFixed(1)})`;
            } else if (sentimentWords.positive.moderate.includes(word)) {
                impact = 2 * wordIntensity;
                explanation = `Moderate positive word (+${impact.toFixed(1)})`;
            } else if (sentimentWords.positive.mild.includes(word)) {
                impact = 1 * wordIntensity;
                explanation = `Mild positive word (+${impact.toFixed(1)})`;
            } else if (sentimentWords.negative.strong.includes(word)) {
                impact = -3 * wordIntensity;
                explanation = `Strong negative word (${impact.toFixed(1)})`;
            } else if (sentimentWords.negative.moderate.includes(word)) {
                impact = -2 * wordIntensity;
                explanation = `Moderate negative word (${impact.toFixed(1)})`;
            } else if (sentimentWords.negative.mild.includes(word)) {
                impact = -1 * wordIntensity;
                explanation = `Mild negative word (${impact.toFixed(1)})`;
            } else if (sentimentModifiers.intensifiers.includes(word)) {
                isModifier = true;
                explanation = 'Intensifier - amplifies next sentiment word by 50%';
            } else if (sentimentModifiers.diminishers.includes(word)) {
                isModifier = true;
                explanation = 'Diminisher - reduces next sentiment word by 30%';
            } else if (sentimentModifiers.negators.includes(word)) {
                isModifier = true;
                explanation = 'Negator - reverses sentiment of following words';
            } else {
                explanation = 'Neutral word - no sentiment impact';
            }
            
            // Apply negation
            if (isNegated && impact !== 0) {
                const originalImpact = impact;
                impact = -impact * 0.8;
                explanation += ` → Negated: ${originalImpact.toFixed(1)} becomes ${impact.toFixed(1)}`;
            }
            
            // Add intensity modifier info
            if (wordIntensity !== 1 && impact !== 0) {
                explanation += ` (${wordIntensity > 1 ? 'intensified' : 'diminished'} by ${Math.abs(wordIntensity - 1) * 100}%)`;
            }
            
            return { impact, explanation, isModifier };
        }

        function showWordDetails(word, impact, explanation) {
            alert(`Word: "${word}"\nImpact Score: ${impact.toFixed(2)}\nExplanation: ${explanation}`);
        }

        function updateConfidenceExplanation(data) {
            const container = document.getElementById('confidenceExplanation');
            
            const factors = [];
            
            // Explain confidence calculation
            factors.push(`🎯 <strong>Overall Confidence: ${data.confidence}%</strong>`);
            factors.push(`📊 Based on multiple factors:`);
            
            // Sentiment density factor
            const densityContribution = Math.min(30, data.sentimentDensity * 1.5);
            factors.push(`• Sentiment word density (${data.sentimentDensity}%): +${densityContribution.toFixed(1)} points`);
            
            // Consistency factor
            const consistencyContribution = data.consistencyScore * 25;
            factors.push(`• Sentiment consistency (${(data.consistencyScore * 100).toFixed(0)}%): +${consistencyContribution.toFixed(1)} points`);
            
            // Magnitude factor
            const magnitudeContribution = data.sentimentMagnitude * 100;
            factors.push(`• Sentiment magnitude (${data.sentimentMagnitude.toFixed(3)}): +${magnitudeContribution.toFixed(1)} points`);
            
            // Word coverage factor
            const coverageContribution = data.wordCoverage * 0.5;
            factors.push(`• Word coverage (${data.wordCoverage}%): +${coverageContribution.toFixed(1)} points`);
            
            // Text length bonus
            const lengthBonus = data.sentenceCount > 3 ? 10 : 0;
            if (lengthBonus > 0) {
                factors.push(`• Text length bonus (${data.sentenceCount} sentences): +${lengthBonus} points`);
            }
            
            factors.push(`📈 <strong>Interpretation:</strong>`);
            if (data.confidence >= 85) {
                factors.push(`• Very high confidence - strong, consistent sentiment signals`);
            } else if (data.confidence >= 70) {
                factors.push(`• Good confidence - reliable sentiment classification`);
            } else if (data.confidence >= 55) {
                factors.push(`• Moderate confidence - some uncertainty in classification`);
            } else {
                factors.push(`• Low confidence - ambiguous or mixed sentiment signals`);
            }
            
            container.innerHTML = factors.map(factor => `<div class="text-sm text-gray-700">${factor}</div>`).join('');
        }

        function updateAlternativeInterpretations(data) {
            const container = document.getElementById('alternativeInterpretations');
            
            const alternatives = [];
            
            // Generate alternative interpretations based on the data
            if (data.overallSentiment.includes('Positive') && data.negativePercent > 20) {
                alternatives.push({
                    title: '🤔 Mixed Sentiment Perspective',
                    description: `While classified as ${data.overallSentiment.toLowerCase()}, the text contains ${data.negativePercent}% negative sentiment. This could indicate nuanced opinions or balanced feedback.`,
                    confidence: Math.max(30, data.confidence - 20)
                });
            }
            
            if (data.overallSentiment.includes('Negative') && data.positivePercent > 20) {
                alternatives.push({
                    title: '🌅 Constructive Criticism View',
                    description: `Despite the ${data.overallSentiment.toLowerCase()} classification, ${data.positivePercent}% positive sentiment suggests constructive feedback rather than pure negativity.`,
                    confidence: Math.max(30, data.confidence - 20)
                });
            }
            
            if (data.confidence < 70) {
                alternatives.push({
                    title: '⚖️ Neutral Interpretation',
                    description: `Given the moderate confidence (${data.confidence}%), this text could be interpreted as neutral with slight emotional leanings rather than definitively ${data.overallSentiment.toLowerCase()}.`,
                    confidence: Math.min(75, data.confidence + 15)
                });
            }
            
            if (data.sentimentDensity < 15) {
                alternatives.push({
                    title: '📋 Factual Content View',
                    description: `Low emotional density (${data.sentimentDensity}%) suggests this might be primarily factual content with incidental sentiment rather than opinion-focused text.`,
                    confidence: Math.max(40, 80 - data.sentimentDensity * 2)
                });
            }
            
            if (data.wordCount < 30) {
                alternatives.push({
                    title: '⚠️ Limited Context Consideration',
                    description: `With only ${data.wordCount} words, the sentiment might change significantly with additional context. Consider analyzing a longer text sample for more reliable results.`,
                    confidence: Math.max(25, data.confidence - 30)
                });
            }
            
            // If no alternatives, add a default one
            if (alternatives.length === 0) {
                alternatives.push({
                    title: '✅ Consistent Classification',
                    description: `The analysis shows consistent sentiment signals with high confidence. Alternative interpretations are unlikely to significantly change the classification.`,
                    confidence: Math.min(95, data.confidence + 10)
                });
            }
            
            container.innerHTML = alternatives.map(alt => `
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 class="font-medium text-gray-800 mb-2">${alt.title}</h5>
                    <p class="text-sm text-gray-700 mb-2">${alt.description}</p>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">Alternative confidence:</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${alt.confidence}%"></div>
                        </div>
                        <span class="text-xs text-gray-600">${alt.confidence}%</span>
                    </div>
                </div>
            `).join('');
        }

        function updateKeywordAnalysis(data) {
            keywordAnalysisData = data;
            const originalText = document.getElementById('textInput').value;
            
            // Extract and analyze keywords with their impact scores
            const keywordData = extractSentimentDrivers(originalText);
            
            // Update top drivers
            updateTopDrivers(keywordData.topDrivers);
            
            // Update keyword categories
            updateKeywordCategories(keywordData);
            
            // Update highlighted text
            updateHighlightedText(originalText, keywordData.allKeywords);
        }

        function extractSentimentDrivers(text) {
            const words = text.toLowerCase().match(/\b\w+\b/g) || [];
            const keywordMap = new Map();
            const modifierMap = new Map();
            const neutralMap = new Map();
            
            // Analyze each word for sentiment impact and frequency
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const prevWord = i > 0 ? words[i - 1] : '';
                
                let impact = 0;
                let category = 'neutral';
                let strength = 'mild';
                
                // Determine word impact and category
                if (sentimentWords.positive.strong.includes(word)) {
                    impact = 3;
                    category = 'positive';
                    strength = 'strong';
                } else if (sentimentWords.positive.moderate.includes(word)) {
                    impact = 2;
                    category = 'positive';
                    strength = 'moderate';
                } else if (sentimentWords.positive.mild.includes(word)) {
                    impact = 1;
                    category = 'positive';
                    strength = 'mild';
                } else if (sentimentWords.negative.strong.includes(word)) {
                    impact = 3;
                    category = 'negative';
                    strength = 'strong';
                } else if (sentimentWords.negative.moderate.includes(word)) {
                    impact = 2;
                    category = 'negative';
                    strength = 'moderate';
                } else if (sentimentWords.negative.mild.includes(word)) {
                    impact = 1;
                    category = 'negative';
                    strength = 'mild';
                }
                
                // Check for modifiers
                if (sentimentModifiers.intensifiers.includes(word) || 
                    sentimentModifiers.diminishers.includes(word) || 
                    sentimentModifiers.negators.includes(word)) {
                    
                    const existing = modifierMap.get(word) || { count: 0, impact: 0.5, type: 'modifier' };
                    existing.count++;
                    modifierMap.set(word, existing);
                } else if (impact > 0) {
                    // Sentiment word
                    const existing = keywordMap.get(word) || { count: 0, impact: 0, category: category, strength: strength };
                    existing.count++;
                    existing.impact = Math.max(existing.impact, impact);
                    keywordMap.set(word, existing);
                } else if (word.length > 3) {
                    // Neutral anchor word
                    const existing = neutralMap.get(word) || { count: 0, impact: 0, category: 'neutral' };
                    existing.count++;
                    neutralMap.set(word, existing);
                }
            }
            
            // Convert maps to arrays and sort
            const positiveDrivers = Array.from(keywordMap.entries())
                .filter(([word, data]) => data.category === 'positive')
                .sort((a, b) => {
                    if (currentKeywordView === 'impact') {
                        return (b[1].impact * b[1].count) - (a[1].impact * a[1].count);
                    } else {
                        return b[1].count - a[1].count;
                    }
                });
                
            const negativeDrivers = Array.from(keywordMap.entries())
                .filter(([word, data]) => data.category === 'negative')
                .sort((a, b) => {
                    if (currentKeywordView === 'impact') {
                        return (b[1].impact * b[1].count) - (a[1].impact * a[1].count);
                    } else {
                        return b[1].count - a[1].count;
                    }
                });
                
            const modifiers = Array.from(modifierMap.entries())
                .sort((a, b) => b[1].count - a[1].count);
                
            const neutralAnchors = Array.from(neutralMap.entries())
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 8); // Limit neutral words
            
            // Get top overall drivers
            const allDrivers = [...positiveDrivers, ...negativeDrivers]
                .sort((a, b) => {
                    if (currentKeywordView === 'impact') {
                        return (b[1].impact * b[1].count) - (a[1].impact * a[1].count);
                    } else {
                        return b[1].count - a[1].count;
                    }
                })
                .slice(0, 6);
            
            return {
                positiveDrivers: positiveDrivers.slice(0, 8),
                negativeDrivers: negativeDrivers.slice(0, 8),
                modifiers: modifiers.slice(0, 6),
                neutralAnchors: neutralAnchors,
                topDrivers: allDrivers,
                allKeywords: new Map([...keywordMap, ...modifierMap])
            };
        }

        function updateTopDrivers(topDrivers) {
            const container = document.getElementById('topDrivers');
            container.innerHTML = '';
            
            topDrivers.forEach(([word, data], index) => {
                const impactScore = currentKeywordView === 'impact' ? 
                    (data.impact * data.count) : data.count;
                const maxScore = currentKeywordView === 'impact' ? 
                    (topDrivers[0][1].impact * topDrivers[0][1].count) : topDrivers[0][1].count;
                const percentage = (impactScore / maxScore) * 100;
                
                const colorClass = data.category === 'positive' ? 
                    'bg-green-500' : 'bg-red-500';
                const bgClass = data.category === 'positive' ? 
                    'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
                
                const div = document.createElement('div');
                div.className = `p-3 rounded-lg border ${bgClass}`;
                div.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-gray-800">${word}</span>
                        <span class="text-sm text-gray-600">
                            ${currentKeywordView === 'impact' ? 'Impact' : 'Frequency'}: ${impactScore.toFixed(1)}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${colorClass} h-2 rounded-full transition-all duration-500" 
                             style="width: ${percentage}%"></div>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                        ${data.strength} ${data.category} • appears ${data.count}x
                    </div>
                `;
                container.appendChild(div);
            });
        }

        function updateKeywordCategories(keywordData) {
            // Update positive drivers
            updateDriverCategory('positiveDrivers', 'positiveDriverCount', 
                keywordData.positiveDrivers, 'bg-green-100 text-green-800 border-green-300');
            
            // Update negative drivers
            updateDriverCategory('negativeDrivers', 'negativeDriverCount', 
                keywordData.negativeDrivers, 'bg-red-100 text-red-800 border-red-300');
            
            // Update modifiers
            updateDriverCategory('modifierWords', 'modifierCount', 
                keywordData.modifiers, 'bg-blue-100 text-blue-800 border-blue-300');
            
            // Update neutral anchors
            updateDriverCategory('neutralAnchors', 'neutralAnchorCount', 
                keywordData.neutralAnchors, 'bg-gray-100 text-gray-800 border-gray-300');
        }

        function updateDriverCategory(containerId, countId, drivers, className) {
            const container = document.getElementById(containerId);
            const countElement = document.getElementById(countId);
            
            container.innerHTML = '';
            countElement.textContent = drivers.length;
            
            drivers.forEach(([word, data]) => {
                const score = currentKeywordView === 'impact' ? 
                    (data.impact * data.count) : data.count;
                
                const div = document.createElement('div');
                div.className = `flex items-center justify-between p-2 rounded border ${className}`;
                div.innerHTML = `
                    <span class="font-medium">${word}</span>
                    <div class="text-right">
                        <div class="text-xs font-medium">${score.toFixed(1)}</div>
                        <div class="text-xs opacity-75">${data.count}x</div>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        function updateHighlightedText(originalText, keywordMap) {
            const words = originalText.split(/(\s+)/); // Preserve whitespace
            let highlightedHtml = '';
            
            words.forEach(word => {
                const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
                const keywordData = keywordMap.get(cleanWord);
                
                if (keywordData && cleanWord.length > 0) {
                    let highlightClass = '';
                    
                    if (keywordData.category === 'positive') {
                        highlightClass = keywordData.impact >= 2.5 ? 
                            'bg-green-200 text-green-900 px-1 rounded' : 
                            'bg-green-100 text-green-800 px-1 rounded';
                    } else if (keywordData.category === 'negative') {
                        highlightClass = keywordData.impact >= 2.5 ? 
                            'bg-red-200 text-red-900 px-1 rounded' : 
                            'bg-red-100 text-red-800 px-1 rounded';
                    } else if (keywordData.type === 'modifier') {
                        highlightClass = 'bg-blue-200 text-blue-900 px-1 rounded';
                    }
                    
                    highlightedHtml += `<span class="${highlightClass}" title="${keywordData.category} (${keywordData.impact || 0.5})">${word}</span>`;
                } else {
                    highlightedHtml += word;
                }
            });
            
            document.getElementById('highlightedText').innerHTML = highlightedHtml;
        }

        function updateInsights(data) {
            const insights = document.getElementById('insights');
            
            // Generate advanced insights based on the analysis
            const insightsList = [];
            
            // Overall sentiment insight with confidence breakdown
            insightsList.push(`📊 Multi-class analysis shows <strong>${data.overallSentiment.toLowerCase()}</strong> sentiment with ${data.confidence}% overall confidence`);
            
            // Confidence quality assessment
            if (data.confidence >= 85) {
                insightsList.push(`🎯 <strong>High confidence</strong> classification - strong sentiment indicators with ${data.consistencyScore} consistency score`);
            } else if (data.confidence >= 70) {
                insightsList.push(`✅ <strong>Good confidence</strong> classification - reliable sentiment patterns detected`);
            } else if (data.confidence >= 55) {
                insightsList.push(`⚠️ <strong>Moderate confidence</strong> - mixed signals or limited sentiment indicators`);
            } else {
                insightsList.push(`❓ <strong>Low confidence</strong> - ambiguous or insufficient sentiment data`);
            }
            
            // Class-specific confidence insights
            const maxConfidence = Math.max(data.positiveConfidence, data.negativeConfidence, data.neutralConfidence);
            let dominantClass = 'neutral';
            if (maxConfidence === data.positiveConfidence) dominantClass = 'positive';
            else if (maxConfidence === data.negativeConfidence) dominantClass = 'negative';
            
            insightsList.push(`📈 Strongest confidence in <strong>${dominantClass}</strong> classification (${maxConfidence}%) with ${data.wordCoverage}% sentiment word coverage`);
            
            // Sentiment density and quality insights
            if (data.sentimentDensity >= 25) {
                insightsList.push(`💪 High emotional density (${data.sentimentDensity}%) indicates expressive, opinion-rich content`);
            } else if (data.sentimentDensity >= 15) {
                insightsList.push(`📊 Moderate emotional density (${data.sentimentDensity}%) suggests balanced emotional content`);
            } else {
                insightsList.push(`📋 Low emotional density (${data.sentimentDensity}%) indicates factual or neutral content`);
            }
            
            // Context-aware insights
            if (data.sentimentMagnitude > 0.15) {
                insightsList.push(`⚡ High sentiment magnitude (${data.sentimentMagnitude.toFixed(3)}) with strong classification confidence`);
            } else if (data.sentimentMagnitude < 0.03) {
                insightsList.push(`🔍 Low sentiment magnitude (${data.sentimentMagnitude.toFixed(3)}) - neutral content with high certainty`);
            }
            
            // Text length and reliability insight
            if (data.wordCount > 50 && data.sentenceCount > 3) {
                insightsList.push(`📝 Comprehensive analysis of ${data.wordCount} words across ${data.sentenceCount} sentences enhances reliability`);
            } else if (data.wordCount < 20) {
                insightsList.push(`⚠️ Short text (${data.wordCount} words) may limit classification accuracy - consider longer samples`);
            }

            insights.innerHTML = insightsList.map(insight => 
                `<div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">${insight}</div>`
            ).join('');
        }

        function updateSentenceAnalysis(sentences, overallScore) {
            const container = document.getElementById('sentenceAnalysis');
            container.innerHTML = '';

            sentences.forEach((sentence, index) => {
                const trimmed = sentence.trim();
                if (trimmed.length === 0) return;

                // Advanced sentiment analysis for each sentence
                const words = trimmed.toLowerCase().match(/\b\w+\b/g) || [];
                let sentenceScore = 0;
                let positiveWords = 0;
                let negativeWords = 0;
                let neutralWords = 0;

                // Apply the same advanced analysis to each sentence
                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    const prevWord = i > 0 ? words[i - 1] : '';
                    
                    let wordScore = 0;
                    let wordIntensity = 1;
                    let isNegated = false;

                    // Check for negation
                    for (let j = Math.max(0, i - 2); j < i; j++) {
                        if (sentimentModifiers.negators.includes(words[j])) {
                            isNegated = true;
                            break;
                        }
                    }

                    // Check for intensifiers/diminishers
                    if (sentimentModifiers.intensifiers.includes(prevWord)) {
                        wordIntensity = 1.5;
                    } else if (sentimentModifiers.diminishers.includes(prevWord)) {
                        wordIntensity = 0.7;
                    }

                    // Classify word sentiment
                    if (sentimentWords.positive.strong.includes(word)) {
                        wordScore = 3 * wordIntensity;
                        positiveWords++;
                    } else if (sentimentWords.positive.moderate.includes(word)) {
                        wordScore = 2 * wordIntensity;
                        positiveWords++;
                    } else if (sentimentWords.positive.mild.includes(word)) {
                        wordScore = 1 * wordIntensity;
                        positiveWords++;
                    } else if (sentimentWords.negative.strong.includes(word)) {
                        wordScore = -3 * wordIntensity;
                        negativeWords++;
                    } else if (sentimentWords.negative.moderate.includes(word)) {
                        wordScore = -2 * wordIntensity;
                        negativeWords++;
                    } else if (sentimentWords.negative.mild.includes(word)) {
                        wordScore = -1 * wordIntensity;
                        negativeWords++;
                    } else {
                        neutralWords++;
                    }

                    // Apply negation
                    if (isNegated && wordScore !== 0) {
                        wordScore = -wordScore * 0.8;
                    }

                    sentenceScore += wordScore;
                }

                // Normalize sentence score
                const normalizedScore = sentenceScore / words.length;
                
                let sentimentClass, sentimentIcon, sentimentLabel, confidenceBar;
                
                if (normalizedScore > 0.1) {
                    if (normalizedScore > 0.3) {
                        sentimentClass = 'border-green-400 bg-green-100';
                        sentimentIcon = '🤩';
                        sentimentLabel = 'Very Positive';
                        confidenceBar = 'bg-green-500';
                    } else if (normalizedScore > 0.15) {
                        sentimentClass = 'border-green-300 bg-green-50';
                        sentimentIcon = '😊';
                        sentimentLabel = 'Positive';
                        confidenceBar = 'bg-green-400';
                    } else {
                        sentimentClass = 'border-green-200 bg-green-25';
                        sentimentIcon = '🙂';
                        sentimentLabel = 'Slightly Positive';
                        confidenceBar = 'bg-green-300';
                    }
                } else if (normalizedScore < -0.1) {
                    if (normalizedScore < -0.3) {
                        sentimentClass = 'border-red-400 bg-red-100';
                        sentimentIcon = '😡';
                        sentimentLabel = 'Very Negative';
                        confidenceBar = 'bg-red-500';
                    } else if (normalizedScore < -0.15) {
                        sentimentClass = 'border-red-300 bg-red-50';
                        sentimentIcon = '😞';
                        sentimentLabel = 'Negative';
                        confidenceBar = 'bg-red-400';
                    } else {
                        sentimentClass = 'border-red-200 bg-red-25';
                        sentimentIcon = '😕';
                        sentimentLabel = 'Slightly Negative';
                        confidenceBar = 'bg-red-300';
                    }
                } else {
                    if (Math.abs(normalizedScore) < 0.05) {
                        sentimentClass = 'border-gray-200 bg-gray-50';
                        sentimentIcon = '😐';
                        sentimentLabel = 'Neutral';
                        confidenceBar = 'bg-gray-400';
                    } else {
                        sentimentClass = 'border-yellow-200 bg-yellow-50';
                        sentimentIcon = '🤔';
                        sentimentLabel = 'Mixed';
                        confidenceBar = 'bg-yellow-400';
                    }
                }

                const confidence = Math.min(100, Math.abs(normalizedScore) * 300);
                
                const div = document.createElement('div');
                div.className = `p-4 rounded-lg border-2 ${sentimentClass}`;
                div.innerHTML = `
                    <div class="flex items-start gap-3">
                        <span class="text-2xl">${sentimentIcon}</span>
                        <div class="flex-1">
                            <p class="text-gray-800">${trimmed}.</p>
                            <div class="mt-3 flex items-center justify-between text-sm">
                                <div class="flex gap-4">
                                    <span class="font-medium">${sentimentLabel}</span>
                                    <span class="text-gray-600">Score: ${normalizedScore.toFixed(2)}</span>
                                    <span class="text-gray-600">Words: +${positiveWords} =${neutralWords} -${negativeWords}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-gray-500">Confidence:</span>
                                    <div class="w-16 h-2 bg-gray-200 rounded-full">
                                        <div class="${confidenceBar} h-2 rounded-full" style="width: ${confidence}%"></div>
                                    </div>
                                    <span class="text-xs text-gray-500">${Math.round(confidence)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        function updateChart(positive, neutral, negative) {
            const ctx = document.getElementById('sentimentChart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.sentimentChartInstance) {
                window.sentimentChartInstance.destroy();
            }

            window.sentimentChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [{
                        data: [positive, neutral, negative],
                        backgroundColor: ['#10B981', '#6B7280', '#EF4444'],
                        borderWidth: 0
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
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }

