
'use strict';
// const fetch = require('node-fetch'); 
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url'); 
const got = require('got'); 
const https = require('https'); 
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const referenceKeyword = []; 
const prefixes = ['best', 'top'];
const suffixes = ['for sales', 'for SEO', 'for marketing', 'for ecommerce', 'to boost sales'];
const maxKeywords = 10000; 

const Crawler = {
    checkFileExist: async (folderPath) => {
        try {
            await fs.access(folderPath, fs.constants.F_OK); 
            return true;  // If no error is thrown, file exists
        } catch (err) { 
            return false; // If error is thrown, file does not exist
        }
    },
    // Helper function to validate links
    isValidLink: async (link) => { 
        const isSocialMedia = /facebook|twitter|instagram|linkedin|pinterest|tumblr|reddit/i.test(link);
        const isTel = /^tel:/i.test(link);
        const isMailto = /^mailto:/i.test(link);
        const isImageLink = /\.(png|jpg|jpeg|gif|bmp|svg|webp|tiff|tif)$/i.test(link);
        const isBitly = /bit\.ly|bitly\.com/i.test(link); // Add condition to ignore Bitly links
      
        return !isSocialMedia && !isTel && !isMailto && !isImageLink && !isBitly;
    },
    // Function to fetch links from a given URL
    fetchLinks: async (url, masterLinks) => { 
        try {
            const { body } = await got(url);
            const $ = cheerio.load(body);
           
            $('a').each((index, element) => {
                const href = $(element).attr('href');
               
                if (href) {
                    const absoluteUrl = new URL(href, url).href;
                    
                    if (Crawler.isValidLink(absoluteUrl) && !masterLinks.has(absoluteUrl)) {
                        masterLinks.add(absoluteUrl);
                    }
                }
            });
            
            return Array.from(masterLinks);
        } catch (error) {
            // console.error(`Error fetching ${url}:`, error.message);
            return [];
        }
    },
    // Function to crawl only the starting page
    crawlSinglePage: async (url) => { 
        const masterLinks = new Set();
        var masterLinksData = await Crawler.fetchLinks(url, masterLinks);
        
        return masterLinksData;
    },
    // Helper function to validate links
    fetchGoogleSearchRankings: async (query, targetUrl) => { 
        const encodedQuery = encodeURIComponent(query);
        // const googleSearchUrl = `https://cse.google.com/cse?cx=211eca3c003af4c10&q=${encodedQuery}`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodedQuery}`;

        const maxPages = 2; // You want to crawl up to 100 pages
        let ranking = -1; // Default ranking if not found

        try {
        // Loop to crawl through the first 100 pages (10 results per page)
            for (let startIndex = 0; startIndex < maxPages * 10; startIndex += 10) {
                const response = await axios.get(googleSearchUrl + startIndex, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    },
                });

                if (response.status !== 200) {
                    console.log('Failed to retrieve search results');
                    console.log('Status Code:', response.status);
                    return;
                }

                const $ = cheerio.load(response.data);

                // Find all search result elements in this page
                
                $('div.g').each((index, element) => {
                    // console.log("Link = ");
                    // console.log($(element));
                    const title = $(element).find('h3').text();
                    const link = $(element).find('a').attr('href');

                    if (link && link.includes(targetUrl)) {
                        ranking = startIndex + index + 1; // The actual ranking is the index on the page plus the offset from startIndex
                        return false; // Break out of the loop once the target URL is found
                    }
                });

                // If we have found the target URL, stop the search
                if (ranking !== -1) {
                    break;
                }
            }

            // If found, return the ranking, else inform the user
            if (ranking !== -1) {
                return ranking;
                // return `Ranked #${ranking} for the query "${query}".`;
            } else {
                return "Not Found";
                // return `Not found in the first ${maxPages * 10} results for the query "${query}".`;
            }

        } catch (error) {
            console.error('Error fetching search results:', error);
            return 'An error occurred while fetching the search results.';
        }
    },
    // Fetch HTML of the target page
    fetchHTML: async (targetUrl) => { 
        try {
            const { data } = await axios.get(targetUrl);
            return data;
        } catch (error) {
            console.error(`Could not fetch ${targetUrl}: ${error.message}`);
            return null;
        }
    },
    // Check each link's status
    checkLink: async (link) => { 
        try {
            const response = await axios.get(link);
            return { link, status: response.status };
        } catch (error) {
            return { link, status: error.response ? error.response.status : 'ERROR' };
        }
    },
    // Function to filter out unwanted links
    isValidUrl: async (href) => { 
        const socialMediaPatterns = [
            /facebook\.com/, /twitter\.com/, /instagram\.com/,
            /linkedin\.com/, /youtube\.com/, /tiktok\.com/,
            /pinterest\.com/
        ];
        
        return (
            href && 
            !href.startsWith('tel:') && 
            !href.startsWith('mailto:') && 
            !href.startsWith('javascript:void(0)') &&
            !socialMediaPatterns.some(pattern => pattern.test(href))
        );
    },
    // Function to find unique broken links
    findBrokenLinks: async (targetUrl) => { 
        const html = await Crawler.fetchHTML(targetUrl);
        if (!html) return [];

        const $ = cheerio.load(html);
        const uniqueLinks = new Set();

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (Crawler.isValidUrl(href)) {
                const absoluteUrl = new URL(href, targetUrl).href;
                uniqueLinks.add(absoluteUrl);  // Add unique links to the set
            }
        });

        const results = await Promise.all(Array.from(uniqueLinks).map(Crawler.checkLink));
        const brokenLinks = results.filter(result => result.status !== 200);
        return brokenLinks;
    },
    // Function to analyzeSEO
    analyzeSEO: async (url) => { 
        try {
            // Fetch the HTML of the page
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
      
            // Initialize an object to hold SEO issues
            const seoIssues = {
                title: '',
                metaDescription: '',
                headings: [],
                images: [],
                missingAlt: [],
                metaTags: [],
                canonical: '',
                viewport: '',
                robots: '',
                openGraph: [],
                structuredData: [],
                errors: [],
                wordCount: 0,
                brokenLinks: [],
                urlIssues: [],
                h1Issues: [],
                pageTitleIssues: [],
                metaDescriptionIssues: [],
                canonicalizationIssues: [],
                thinContentIssues: [],
                sslCertificateIssues: [],
                faviconIssues: []
            };
      
            // Check for SSL certificate
            if (!url.startsWith('https://')) {
                seoIssues.sslCertificateIssues.push('Page is not served over HTTPS (SSL certificate is missing)');
            } else {
                try {
                    const response = await axios.get(url);
                    if (response.request.connection.encrypted) {
                        seoIssues.sslCertificateIssues.push('SSL certificate is available');
                    }
                } catch (error) {
                    seoIssues.sslCertificateIssues.push('SSL certificate is not valid or unavailable');
                }
            }
      
            // Get the title
            seoIssues.title = $('title').text() || 'No title found';
      
            // Get the meta description
            seoIssues.metaDescription = $('meta[name="description"]').attr('content') || 'No meta description found';
      
            // Get all headings
            for (let i = 1; i <= 6; i++) {
                const heading = $(`h${i}`).map((_, el) => $(el).text()).get();
                if (heading.length > 0) {
                    seoIssues.headings.push({ [`h${i}`]: heading });
                }
            }
      
            // Analyze images
            $('img').each((_, el) => {
                const imgSrcTmp = $(el).attr('src');
                const altText = $(el).attr('alt');
                const absoluteUrl = new URL(imgSrcTmp, url);
                absoluteUrl.search = '';  // This removes the query parameters
                // Return the URL without query parameters
                const imgSrc = absoluteUrl.toString();
                 
                //seoIssues.images.push(imgSrc);
                if (!altText) {
                    seoIssues.missingAlt.push(imgSrc);
                }
                if (altText && altText.length > 100) {
                    seoIssues.errors.push(`Alt text too long for image: ${imgSrc}`);
                }
                // Check for oversized images (more than 1MB)
                axios.head(imgSrc).then(res => {
                    if (res.headers['content-length'] && parseInt(res.headers['content-length']) > 1048576) {
                        seoIssues.errors.push(`Oversized image: ${imgSrc}`);
                    }
                }).catch(error => {
                    console.error(`Error checking image size: ${imgSrc}`, error);
                });
            });
      
            // Get all meta tags
            $('meta').each((_, el) => {
                const name = $(el).attr('name');
                const content = $(el).attr('content');
                if (name) {
                    seoIssues.metaTags.push({ [name]: content });
                }
            });
      
            // Check for canonical tag
            seoIssues.canonical = $('link[rel="canonical"]').attr('href') || 'No canonical tag found';
      
            // Check for canonicalization issues (missing, multiple, wrong)
            const canonicalLinks = $('link[rel="canonical"]');
            if (canonicalLinks.length === 0) {
                seoIssues.canonicalizationIssues.push('No canonical tag found');
            } else if (canonicalLinks.length > 1) {
                seoIssues.canonicalizationIssues.push('Multiple canonical tags found');
            } else {
                const canonicalUrl = canonicalLinks.attr('href');
                if (canonicalUrl !== url) {
                    seoIssues.canonicalizationIssues.push(`Canonical URL is incorrect: ${canonicalUrl}`);
                }
            }
      
            // Check for favicon image
            const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
            if (favicon) {
                seoIssues.faviconIssues.push(`Favicon is available: ${favicon}`);
            } else {
                seoIssues.faviconIssues.push('Favicon is missing');
            }
      
            // Check for viewport meta tag
            seoIssues.viewport = $('meta[name="viewport"]').attr('content') || 'No viewport meta tag found';
      
            // Check for robots meta tag
            seoIssues.robots = $('meta[name="robots"]').attr('content') || 'No robots meta tag found';
      
            // Analyze Open Graph tags
            $('meta[property^="og:"]').each((_, el) => {
                const property = $(el).attr('property');
                const content = $(el).attr('content');
                seoIssues.openGraph.push({ [property]: content });
            });
      
            // Analyze structured data (JSON-LD)
            $('script[type="application/ld+json"]').each((_, el) => {
                try {
                    const jsonData = JSON.parse($(el).html());
                    seoIssues.structuredData.push(jsonData);
                } catch (error) {
                    console.error('Error parsing structured data:', error);
                }
            });
      
            // URL checks
            const urlObj = new URL(url);
            if (urlObj.pathname !== urlObj.pathname.toLowerCase()) {
                seoIssues.urlIssues.push('URL contains uppercase characters');
            }
            if (url.includes('%')) {
                seoIssues.urlIssues.push('URL contains special characters');
            }
            if (url.length > 115) {
                seoIssues.urlIssues.push('URL is over 115 characters');
            }
      
            // Check for common SEO errors
            if (!seoIssues.title || seoIssues.title.length > 60) {
                seoIssues.errors.push('Title is missing or too long (should be less than 60 characters)');
            }
            if (seoIssues.title.length < 30) {
                seoIssues.pageTitleIssues.push('Page title is too short (should be more than 30 characters)');
            }
            if (seoIssues.title.length > 60) {
                seoIssues.pageTitleIssues.push('Page title is too long (should be less than 60 characters)');
            }
            if (!seoIssues.metaDescription || seoIssues.metaDescription.length > 160) {
                seoIssues.errors.push('Meta description is missing or too long (should be less than 160 characters)');
            }
            if (seoIssues.metaDescription.length < 70) {
                seoIssues.metaDescriptionIssues.push('Meta description is too short (should be more than 70 characters)');
            }
            if (seoIssues.metaDescription.length > 160) {
                seoIssues.metaDescriptionIssues.push('Meta description is too long (should be less than 160 characters)');
            }
      
            // Check for missing H1, duplicate H1, multiple H1, H1 length
            const h1Tags = $('h1');
            if (h1Tags.length === 0) {
                seoIssues.h1Issues.push('Missing H1 tag');
            }
            if (h1Tags.length > 1) {
                seoIssues.h1Issues.push('Multiple H1 tags');
            }
            if (h1Tags.length === 1 && h1Tags.text().length > 70) {
                seoIssues.h1Issues.push('H1 tag is too long (should be less than 70 characters)');
            }
      
            // Word count
            const bodyText = $('body').text();
            seoIssues.wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;
      
            // Low Content / Thin Content Check (less than 300 words in this example)
            if (seoIssues.wordCount < 300) {
                seoIssues.thinContentIssues.push('Page has low content (less than 300 words)');
            }
      
            // Check for broken links
            const links = $('a');
            for (let i = 0; i < links.length; i++) {
                const link = links.eq(i);
                const href = link.attr('href');
                if (href && href.startsWith('http') && Crawler.isValidUrl(href)) {
                    try {
                        const response = await axios.head(href);
                        if (response.status >= 400) {
                            seoIssues.brokenLinks.push(href);
                        }
                    } catch (error) {
                        seoIssues.brokenLinks.push(href);
                    }
                }
            }
      
            // Output the SEO issues
            return seoIssues;
        } catch (error) {
            console.error(`Error fetching the URL: ${error.message}`);
        }
    },
    // Function to getSeoScore
    getSeoScore: async (url) => { 
         
        try {
            const response = await axios.get(url);
           
            const $ = cheerio.load(response.data);
      
            // Extract SEO relevant data
            const title = $('title').text();
            const metaDescription = $('meta[name="description"]').attr('content') || 'No description';
            const h1 = $('h1').text();
            const h2 = $('h2').text();
            const h3 = $('h3').text();
      
            // Calculate SEO score
            const seoScore = Crawler.calculateSeoScore(title, metaDescription, h1, h2, h3);
            
            return {
                title,
                metaDescription,
                h1,
                h2,
                h3,
                seoScore
            };
        } catch (error) {
            // console.error('Error fetching the URL:', error);
            // throw new Error('Error fetching the URL');
        }
    },
    // Function to crawlSinglePageSEORank
    crawlSinglePageSEORank: async (targetUrl,SHOPIFY_STORE_URL,SHOPIFY_ACCESS_TOKEN) => { 
        const seoSearchUrl = targetUrl+".json";

        try {
            // Loop to crawl through the first 100 pages (10 results per page)
            const response = await axios.get(seoSearchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });

            if (response.status !== 200) {
                console.log('Failed to retrieve search results');
                console.log('Status Code:', response.status);
                return;
            }

            let googleRankings = [];
            
            if (response.data.product) {
                var product = response.data.product;

                // Fetch metafields if needed (assuming metafields are available in your setup)
                const metafieldsResponse = await fetch(`https://${SHOPIFY_STORE_URL}/admin/api/2023-10/products/${product.id}/metafields.json`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                    },
                });

                const metafieldsData = await metafieldsResponse.json();
                const metafields = metafieldsData.metafields || [];

                const metaTitle = metafields.find(mf => mf.key === 'title_tag')?.value || null; //roduct.title;

                
                let productTags = [];
                if (product.tags.length > 0) {
                    productTags = await Promise.all(product.tags.split(", ").map(async (edgeTag) => {

                        const query = edgeTag; // Change this to your desired search term                
                        var ranking = await Crawler.fetchGoogleSearchRankings(query, targetUrl);

                        return {
                            tag: edgeTag,
                            ranking: ranking,
                            url: targetUrl,
                            name: edgeTag,
                        }

                    }));
                }
                if (metaTitle != "" && metaTitle != null) {
                    const query = metaTitle; // Change this to your desired search term            
                    var ranking = await Crawler.fetchGoogleSearchRankings(query, targetUrl);

                    productTags = productTags.concat({
                        metatitle: metaTitle,
                        ranking: ranking,
                        url: targetUrl,
                        name: metaTitle,
                    });
                    
                }
                if (product.productType != "" && product.productType != null) {
                    const query = product.productType; // Change this to your desired search term            
                    var ranking = await Crawler.fetchGoogleSearchRankings(query, targetUrl);

                    productTags = productTags.concat({
                        type: product.productType,
                        ranking: ranking,
                        url: targetUrl,
                        name: product.productType,
                    });
                    
                }

                googleRankings = googleRankings.concat(productTags);
            }

            return googleRankings; 
            

        } catch (error) {
            //console.error('Error fetching search results:', error);
            return 'An error occurred while fetching the search results.';
        }
    },
     // Function to getSeoScore
    calculateSeoScore: (title, metaDescription, h1, h2, h3) => { 
        let score = 0;

        // Simple scoring logic
        if (title.length > 0) score += 20;
        if (metaDescription.length > 0) score += 20;
        if (h1.length > 0) score += 20;
        if (h2.length > 0) score += 15;
        if (h3.length > 0) score += 10;
      
        // Add more complex scoring logic as needed
        return score;
    },

    // Remove protocol (http/https) & split by common delimiters for keywordFromURL
    extractKeywordsFromURL: async (url) => { 
        return url.replace(/^https?:\/\/(www\.)?/, '')
        .split(/[\/?=&.]+/)
        .filter(Boolean)
        .join(', ');
    },
    // scrapeMetaData
    scrapeMetaData: async (url) => { 
        const browser = await puppeteer.launch({ headless: true }); 
        const page = await browser.newPage();
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); 
            const metaData = await page.evaluate(() => {
                const title = document.querySelector('title') ? document.querySelector('title').innerText : '';
                let description = document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : '';

                if (!description) {
                    const paragraph = document.querySelector('p');
                    if (paragraph) description = paragraph.innerText;
                }

                return { title, description };
            });

            const keywordFromURL = Crawler.extractKeywordsFromURL(url);
            return { ...metaData, keywordFromURL };

        } catch (error) {
            console.error(`Error fetching metadata for ${url}:`, error);
            return { title: '', description: '', keywordFromURL: '' };
        } finally {
            await browser.close();
        }
    },
    // Scrapes SERP results for a given keyword and the number of pages to scrape
    scrapeSERP: async (keyword, pages = 1) => { 
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const results = [];
        
        for (let i = 0; i < pages; i++) {
            const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${i * 10}`;
            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout to 60 seconds
            } catch (error) {
                console.error(`Error loading page ${url}:`, error);
                continue; // Skip this page and continue
            }

            const pageResults = await page.evaluate(() => {
                const items = [];
                document.querySelectorAll('.tF2Cxc').forEach(container => {
                    const title = container.querySelector('h3') ? container.querySelector('h3').innerText : '';
                    const link = container.querySelector('a') ? container.querySelector('a').href : '';
                    const description = container.querySelector('.IsZvec') ? container.querySelector('.IsZvec').innerText : '';
                    items.push({ title, link, description });
                });
                return items;
            });

            results.push(...pageResults);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Sleep between requests
        }

        await browser.close();
        return results;
    },
    // Fetch suggestions from Google
    // extractKeywordsFromURL: async (keyword) => { 
    //     const url = `https://suggestqueries.google.com/complete/search?client=firefox&gl=us&q=${encodeURIComponent(keyword)}`;
    //     try {
    //         const response = await axios.get(url);
    //         return response.data[1];
    //     } catch (error) {
    //         console.error(`Error fetching suggestions for "${keyword}":`, error);
    //         return [];
    //     }
    // },
    // Gathers all keywords by expanding seed keywords and fetching autocomplete suggestions
    gatherKeywords: async (seedKeywords) => { 
        let allKeywords = new Set();

        for (const keyword of seedKeywords) {
            const suggestions = await Crawler.fetchAutocompleteSuggestions(keyword);
            suggestions.forEach(suggestion => allKeywords.add(suggestion));
            
            const subSuggestions = await Promise.all(
                suggestions.map(suggestion => Crawler.fetchAutocompleteSuggestions(suggestion))
            );
      
            subSuggestions.flat().forEach(subSuggestion => allKeywords.add(subSuggestion));
      
            if (allKeywords.size >= 100000) break; 
        }
      
        return Array.from(allKeywords).slice(0, 100000);
    },
    // Fetch suggestions from Google
    fetchAutocompleteSuggestions: async (keyword) => { 
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&gl=us&q=${encodeURIComponent(keyword)}`;
        try {
            const response = await axios.get(url);
            return response.data[1];
        } catch (error) {
            console.error(`Error fetching suggestions for "${keyword}":`, error);
            return [];
        }
    }, 
    // Gathers keywords with recursive fetching for deeper suggestions
    gatherKeyword: async (referenceKeyword) => {
        let allKeywords = new Set(referenceKeyword);
    
        async function fetchSuggestionsRecursively(keyword, depth) {
            if (depth === 0 || allKeywords.size >= maxKeywords) return;
    
            const suggestions = await Crawler.fetchAutocompleteSuggestions(keyword);
            suggestions.forEach(suggestion => allKeywords.add(suggestion));
    
            // Recursively fetch suggestions for each new suggestion
            for (const suggestion of suggestions) {
                if (allKeywords.size >= maxKeywords) break;
                await fetchSuggestionsRecursively(suggestion, depth - 1);
            }
        }
    
        // Generate keywords with prefixes and suffixes
        const expandedKeywords = referenceKeyword.flatMap(keyword => [
            keyword,
            ...prefixes.map(prefix => `${prefix} ${keyword}`),
            ...suffixes.map(suffix => `${keyword} ${suffix}`)
        ]);
    
        // Start gathering keywords with recursive depth of 2
        for (const keyword of expandedKeywords) {
            if (allKeywords.size >= maxKeywords) break;
            await fetchSuggestionsRecursively(keyword, 2);
        }
    
        return Array.from(allKeywords).slice(0, maxKeywords); 
    },  
    //***** HELPER FUNCTION FOR KEYWORD FORMATE *******//
    formatKeywords: (keywords, source) => {
        return keywords.map(keyword => ({
            keyword,
            source,
            visitUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
        }));
    }, 
    //********* HELPER FUNCTION FOR SCRP KEYWORD JS FILE ************
    scrapeSERPData: async (keyword) => {
        try {
            const serpData = await Crawler.scrapeSERP(keyword);
            return await Promise.all(serpData.map(async (result) => {
                const metaData = await Crawler.scrapeMetaData(result.link);
                return {
                    title: result.title,
                    url: result.link,
                    description: result.description,
                    keywordFromURL: metaData.keywordFromURL,
                    metaTitle: metaData.title,
                    metaDescription: metaData.description,
                    source: 'serpData'
                };
            }));
        } catch (error) {
            console.error("Error in scrapeSERPData:", error);
            throw new Error("Error fetching SERP data");
        }
    }, 
    //************* HELPER FUNCTION FOR GATHER & FORMATE KEYWORDS FROM  KEYWORD-JS FILE **********//
    gatherAndFormatKeywords: async (keywords, source) => {
        try {
            const allKeywords = await Crawler.gatherKeywords(keywords);
            return Crawler.formatKeywords(allKeywords, source);
        } catch (error) {
            console.error(`Error in gatherAndFormatKeywords for source ${source}:`, error);
            throw new Error(`Error fetching ${source} keywords`);
        }
    }, 
    // ************* HELPER FUNCTION FOR GATHER & FORMATE KEYWORDS FROM REFERENCE KEYWORD-JS FILE **********//
    gatherAndFormatKeyword: async (keywords, source) => {
        try {
            const allKeywords = await Crawler.gatherKeyword(keywords);
            return Crawler.formatKeywords(allKeywords, source);
        } catch (error) {
            console.error(`Error in gatherAndFormatKeyword for source ${source}:`, error);
            throw new Error(`Error fetching ${source} keywords`);
        }
    }



}

module.exports = Crawler;