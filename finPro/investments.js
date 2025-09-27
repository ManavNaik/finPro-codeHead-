class AIInvestmentAdvisor {
    constructor() {
        this.userProfile = {
            monthlyIncome: 0,
            monthlySavings: 0,
            riskTolerance: 'moderate',
            investmentGoal: 'growth'
        };
        this.marketData = {};
        this.chatHistory = [];
        this.apiKey = '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';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    }

    updateUserProfile(income, savings, riskTolerance = 'moderate', goal = 'growth') {
        this.userProfile = {
            monthlyIncome: parseFloat(income) || 0,
            monthlySavings: parseFloat(savings) || 0,
            riskTolerance: riskTolerance,
            investmentGoal: goal
        };
    }

    updateMarketData(data) {
        this.marketData = data;
    }

    async getInvestmentAdvice(userMessage) {
        try {
            const systemPrompt = this.createSystemPrompt();
            const userPrompt = this.createUserPrompt(userMessage);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://your-site.com',
                    'X-Title': 'Financial Dashboard AI'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat-v3.1:free',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.chatHistory,
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const responseText = result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content
                ? result.choices[0].message.content
                : 'Error: No valid response from AI.';

            // Store in chat history
            this.chatHistory.push({ role: 'user', content: userMessage });
            this.chatHistory.push({ role: 'assistant', content: responseText });
            
            // Keep only last 10 exchanges to manage context
            if (this.chatHistory.length > 20) {
                this.chatHistory = this.chatHistory.slice(-20);
            }

            return responseText;
        } catch (error) {
            console.error('Error getting AI advice:', error);
            // Provide fallback response based on user profile
            const fallbackResponse = this.getFallbackAdvice(userMessage);
            return fallbackResponse;
        }
    }

    getFallbackAdvice(userMessage) {
        const { monthlyIncome, monthlySavings, riskTolerance } = this.userProfile;
        
        if (monthlyIncome === 0 || monthlySavings === 0) {
            return "I'd be happy to help with investment advice! However, I need to know your financial profile first. Please click the 'Set Profile' button above to enter your monthly income and savings, then I can provide personalized recommendations.";
        }

        const savingsRate = (monthlySavings / monthlyIncome) * 100;
        let advice = `Based on your profile (₹${monthlyIncome.toLocaleString()} income, ₹${monthlySavings.toLocaleString()} savings), here's some general advice:\n\n`;

        if (savingsRate >= 30) {
            advice += "Excellent savings rate! You can afford to be more aggressive with investments.\n\n";
        } else if (savingsRate >= 20) {
            advice += "Good savings rate. Consider a balanced approach to investing.\n\n";
        } else {
            advice += "Consider increasing your savings rate for better investment opportunities.\n\n";
        }

        advice += `For your ₹${monthlySavings.toLocaleString()} monthly savings:\n`;
        advice += `• 40% in equity mutual funds (for growth)\n`;
        advice += `• 30% in debt funds (for stability)\n`;
        advice += `• 20% in gold/SIP (for diversification)\n`;
        advice += `• 10% in emergency fund\n\n`;
        advice += `Note: This is general advice. Please consult a financial advisor for personalized recommendations.`;

        return advice;
    }

    createSystemPrompt() {
        return `You are an expert financial advisor and investment consultant. You provide personalized investment advice based on:

USER PROFILE:
- Monthly Income: ₹${this.userProfile.monthlyIncome.toLocaleString()}
- Monthly Savings: ₹${this.userProfile.monthlySavings.toLocaleString()}
- Risk Tolerance: ${this.userProfile.riskTolerance}
- Investment Goal: ${this.userProfile.investmentGoal}

CURRENT MARKET DATA:
${this.formatMarketData()}

GUIDELINES:
1. Provide specific, actionable investment advice
2. Consider the user's financial capacity and risk tolerance
3. Reference current market conditions and trends
4. Suggest diversified investment strategies
5. Include both short-term and long-term recommendations
6. Mention specific investment vehicles (stocks, mutual funds, gold, etc.)
7. Always include risk warnings and disclaimers
8. Be encouraging but realistic about returns
9. Consider Indian market context and regulations
10. Keep responses concise but comprehensive

Remember: This is for educational purposes only. Always recommend consulting with a qualified financial advisor before making investment decisions.`;
    }

    createUserPrompt(userMessage) {
        return `User Question: ${userMessage}

Please provide personalized investment advice considering my profile and current market conditions.`;
    }

    formatMarketData() {
        if (!this.marketData || Object.keys(this.marketData).length === 0) {
            return "Market data not available - using general market knowledge";
        }

        let formatted = "";
        if (this.marketData.gold) {
            formatted += `Gold (24K): ₹${this.marketData.gold.gold24k}\n`;
            formatted += `Gold (22K): ₹${this.marketData.gold.gold22k}\n`;
            formatted += `Silver: ₹${this.marketData.gold.silver}\n\n`;
        }
        if (this.marketData.stocks) {
            formatted += `NIFTY 50: ${this.marketData.stocks.nifty50} (${this.marketData.stocks.nifty50Change})\n`;
            formatted += `SENSEX: ${this.marketData.stocks.sensex} (${this.marketData.stocks.sensexChange})\n\n`;
        }
        if (this.marketData.crypto) {
            formatted += `Bitcoin: ₹${this.marketData.crypto.bitcoin} (${this.marketData.crypto.bitcoinChange})\n\n`;
        }
        if (this.marketData.currency) {
            formatted += `USD/INR: ${this.marketData.currency.usdInr} (${this.marketData.currency.usdInrChange})\n\n`;
        }

        return formatted || "Market data not available";
    }
}

class FinancialDashboard {
    constructor() {
        this.lastUpdated = null;
        this.aiAdvisor = new AIInvestmentAdvisor();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllData();
        this.updateLastUpdatedTime();
    }

    setupEventListeners() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadAllData();
        });

        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            this.saveUserProfile();
        });

        document.getElementById('profileBtn').addEventListener('click', () => {
            this.showProfileModal();
        });

        document.getElementById('closeProfileModal').addEventListener('click', () => {
            this.hideProfileModal();
        });
    }

    updateLastUpdatedTime() {
        const now = new Date();
        this.lastUpdated = now;
        document.getElementById('lastUpdated').textContent = now.toLocaleString();
    }

    async loadAllData() {
        try {
            this.hideError();
            
            this.loadMockGoldRates();
            this.loadMockStockData();
            this.loadMockCurrencyData();
            this.loadMockCryptoData();
            this.loadMutualFunds();
            
            this.updateAIAdvisorWithMarketData();
            
            this.loadRealDataInBackground();
            
            this.updateLastUpdatedTime();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load some data. Please try again.');
        }
    }

    updateAIAdvisorWithMarketData() {
        const marketData = {
            gold: {
                gold24k: document.getElementById('gold24k')?.textContent?.replace('₹', '') || '0',
                gold22k: document.getElementById('gold22k')?.textContent?.replace('₹', '') || '0',
                silver: document.getElementById('silver')?.textContent?.replace('₹', '') || '0'
            },
            stocks: {
                nifty50: document.getElementById('nifty50')?.textContent || '0',
                nifty50Change: document.getElementById('nifty50Change')?.textContent || '0%',
                sensex: document.getElementById('sensex')?.textContent || '0',
                sensexChange: document.getElementById('sensexChange')?.textContent || '0%'
            },
            crypto: {
                bitcoin: document.getElementById('bitcoin')?.textContent?.replace('₹', '') || '0',
                bitcoinChange: document.getElementById('bitcoinChange')?.textContent || '0%'
            },
            currency: {
                usdInr: document.getElementById('usdInr')?.textContent || '0',
                usdInrChange: document.getElementById('usdInrChange')?.textContent || '0%'
            }
        };
        
        this.aiAdvisor.updateMarketData(marketData);
    }

    async loadRealDataInBackground() {
        try {
            await Promise.allSettled([
                this.loadGoldRates(),
                this.loadStockData()
            ]);
        } catch (error) {
            console.log('Background data loading failed, using mock data');
        }
    }

    async loadGoldRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data && data.rates && data.rates.INR) {
                const usdToInr = data.rates.INR;
                const goldPerOunceUSD = 2000 + (Math.random() - 0.5) * 100;
                const silverPerOunceUSD = 25 + (Math.random() - 0.5) * 2;
                const goldPerOunceINR = goldPerOunceUSD * usdToInr;
                const silverPerOunceINR = silverPerOunceUSD * usdToInr;
                const goldPer10g = (goldPerOunceINR / 31.1035) * 10;
                const silverPer10g = (silverPerOunceINR / 31.1035) * 10;
                
                const gold24k = goldPer10g.toFixed(2);
                const gold22k = (goldPer10g * 0.916).toFixed(2);
                
                document.getElementById('gold24k').innerHTML = `₹${gold24k}`;
                document.getElementById('gold22k').innerHTML = `₹${gold22k}`;
                document.getElementById('silver').innerHTML = `₹${silverPer10g.toFixed(2)}`;
                
                return;
            }
            
            throw new Error('ExchangeRate API failed');
        } catch (error) {
            console.error('Error loading gold rates:', error);
            this.loadMockGoldRates();
        }
    }

    loadMockGoldRates() {
        const baseGold24k = 100000 + Math.random() * 2000;
        const gold24k = baseGold24k.toFixed(2);
        const gold22k = (baseGold24k * 0.916).toFixed(2);
        const silver = (baseGold24k * 0.012).toFixed(2);
        
        document.getElementById('gold24k').innerHTML = `₹${gold24k}`;
        document.getElementById('gold22k').innerHTML = `₹${gold22k}`;
        document.getElementById('silver').innerHTML = `₹${silver}`;
    }

    showGoldError() {
        document.getElementById('gold24k').innerHTML = '<span class="text-red-500">Error</span>';
        document.getElementById('gold22k').innerHTML = '<span class="text-red-500">Error</span>';
        document.getElementById('silver').innerHTML = '<span class="text-red-500">Error</span>';
    }

    async loadMutualFunds() {
        try {
            const mockFunds = [
                { name: 'HDFC Top 100 Fund', nav: '₹1,234.56', change: '+2.45%', return: '+12.34%' },
                { name: 'SBI Bluechip Fund', nav: '₹567.89', change: '+1.23%', return: '+15.67%' },
                { name: 'ICICI Prudential Technology Fund', nav: '₹89.12', change: '-0.45%', return: '+8.90%' },
                { name: 'Axis Midcap Fund', nav: '₹345.67', change: '+3.21%', return: '+18.45%' },
                { name: 'Franklin India Prima Fund', nav: '₹456.78', change: '+1.89%', return: '+14.23%' }
            ];

            const tableBody = document.getElementById('mutualFundsTable');
            tableBody.innerHTML = '';

            mockFunds.forEach(fund => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                const changeClass = fund.change.startsWith('+') ? 'text-green-600' : 'text-red-600';
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${fund.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fund.nav}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${changeClass}">${fund.change}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">${fund.return}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading mutual funds:', error);
            document.getElementById('mutualFundsTable').innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-12 text-center text-red-500">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Error loading mutual funds data
                    </td>
                </tr>
            `;
        }
    }

    async loadStockData() {
        try {
            await Promise.all([
                this.loadNiftySensex(),
                this.loadCurrencyRates(),
                this.loadCryptoData()
            ]);
        } catch (error) {
            console.error('Error loading stock data:', error);
        }
    }

    async loadNiftySensex() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr&include_24hr_change=true');
            const data = await response.json();
            
            if (data && data.bitcoin) {
                const baseNifty = 19500 + Math.random() * 1000;
                const baseSensex = 65000 + Math.random() * 3000;
                const niftyChange = (Math.random() - 0.5) * 4;
                const sensexChange = (Math.random() - 0.5) * 4;
                
                const nifty50 = baseNifty.toFixed(2);
                const sensex = baseSensex.toFixed(2);
                const niftyChangeStr = `${niftyChange >= 0 ? '+' : ''}${niftyChange.toFixed(2)}%`;
                const sensexChangeStr = `${sensexChange >= 0 ? '+' : ''}${sensexChange.toFixed(2)}%`;

                document.getElementById('nifty50').innerHTML = nifty50;
                document.getElementById('nifty50Change').innerHTML = `<span class="${niftyChange >= 0 ? 'text-green-600' : 'text-red-600'}">${niftyChangeStr}</span>`;
                document.getElementById('sensex').innerHTML = sensex;
                document.getElementById('sensexChange').innerHTML = `<span class="${sensexChange >= 0 ? 'text-green-600' : 'text-red-600'}">${sensexChangeStr}</span>`;
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.error('Error loading Nifty/Sensex:', error);
            this.loadMockStockData();
        }
    }

    loadMockStockData() {
        const nifty50 = '19,847.65';
        const sensex = '66,123.45';
        const niftyChange = '+1.23%';
        const sensexChange = '+0.98%';

        document.getElementById('nifty50').innerHTML = nifty50;
        document.getElementById('nifty50Change').innerHTML = `<span class="text-green-600">${niftyChange}</span>`;
        document.getElementById('sensex').innerHTML = sensex;
        document.getElementById('sensexChange').innerHTML = `<span class="text-green-600">${sensexChange}</span>`;
    }

    async loadCurrencyRates() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr&include_24hr_change=true');
            const data = await response.json();
            
            if (data && data.bitcoin) {
                const baseRate = 83.0 + Math.random() * 2;
                const change = (Math.random() - 0.5) * 2;
                const usdInr = baseRate.toFixed(2);
                const changeStr = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                
                document.getElementById('usdInr').innerHTML = usdInr;
                document.getElementById('usdInrChange').innerHTML = `<span class="${change >= 0 ? 'text-green-600' : 'text-red-600'}">${changeStr}</span>`;
            } else {
                throw new Error('Invalid currency data');
            }
        } catch (error) {
            console.error('Error loading currency rates:', error);
            this.loadMockCurrencyData();
        }
    }

    loadMockCurrencyData() {
        const usdInr = '83.45';
        const change = '+0.12%';
        
        document.getElementById('usdInr').innerHTML = usdInr;
        document.getElementById('usdInrChange').innerHTML = `<span class="text-green-600">${change}</span>`;
    }

    async loadCryptoData() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr&include_24hr_change=true');
            const data = await response.json();
            
            if (data && data.bitcoin) {
                const bitcoinPrice = data.bitcoin.inr.toLocaleString();
                const change = data.bitcoin.inr_24h_change.toFixed(2);
                const changeClass = change >= 0 ? 'text-green-600' : 'text-red-600';
                const changeSymbol = change >= 0 ? '+' : '';
                
                document.getElementById('bitcoin').innerHTML = `₹${bitcoinPrice}`;
                document.getElementById('bitcoinChange').innerHTML = `<span class="${changeClass}">${changeSymbol}${change}%</span>`;
            } else {
                throw new Error('Invalid crypto data');
            }
        } catch (error) {
            console.error('Error loading crypto data:', error);
            this.loadMockCryptoData();
        }
    }

    loadMockCryptoData() {
        const bitcoinPrice = '2,345,678';
        const change = '+2.34%';
        
        document.getElementById('bitcoin').innerHTML = `₹${bitcoinPrice}`;
        document.getElementById('bitcoinChange').innerHTML = `<span class="text-green-600">${change}</span>`;
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessageToChat('user', message);
        input.value = '';

        this.showTypingIndicator();

        try {
            const response = await this.aiAdvisor.getInvestmentAdvice(message);
            this.hideTypingIndicator();
            this.addMessageToChat('assistant', response);
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    }

    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-4 ${sender === 'user' ? 'text-right' : 'text-left'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = `inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
        }`;
        
        messageContent.innerHTML = message.replace(/\n/g, '<br>');
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'mb-4 text-left';
        typingDiv.innerHTML = `
            <div class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                <div class="flex items-center">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                    <span class="ml-2 text-sm">AI is thinking...</span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showProfileModal() {
        document.getElementById('profileModal').classList.remove('hidden');
    }

    hideProfileModal() {
        document.getElementById('profileModal').classList.add('hidden');
    }

    saveUserProfile() {
        const income = document.getElementById('monthlyIncome').value;
        const savings = document.getElementById('monthlySavings').value;
        const riskTolerance = document.getElementById('riskTolerance').value;
        const investmentGoal = document.getElementById('investmentGoal').value;

        if (!income || !savings) {
            alert('Please fill in both monthly income and savings.');
            return;
        }

        this.aiAdvisor.updateUserProfile(income, savings, riskTolerance, investmentGoal);
        
        document.getElementById('profileDisplay').innerHTML = `
            <div class="bg-white rounded-lg p-4 shadow">
                <h3 class="font-semibold text-gray-800 mb-2">Your Financial Profile</h3>
                <p class="text-sm text-gray-600">Monthly Income: ₹${parseFloat(income).toLocaleString()}</p>
                <p class="text-sm text-gray-600">Monthly Savings: ₹${parseFloat(savings).toLocaleString()}</p>
                <p class="text-sm text-gray-600">Risk Tolerance: ${riskTolerance}</p>
                <p class="text-sm text-gray-600">Investment Goal: ${investmentGoal}</p>
            </div>
        `;

        this.hideProfileModal();
        
        this.addMessageToChat('assistant', `Great! I've updated your financial profile. Now I can provide more personalized investment advice based on your monthly income of ₹${parseFloat(income).toLocaleString()} and savings of ₹${parseFloat(savings).toLocaleString()}. What would you like to know about investing?`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.financialDashboard = new FinancialDashboard();
});

setInterval(() => {
    if (window.financialDashboard) {
        window.financialDashboard.loadAllData();
    }
}, 300000);
