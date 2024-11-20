
'use strict';
// const fetch = require('node-fetch');
const shopify = require('./../../config/shopify');

const ShopifyApi = {

    getAllProductCount: async () => { 
        const productCount = await shopify.product.count();
        return productCount;
    },
    getAllCollectionCount: async () => {  
        const collections = await shopify.collect.list();
        return collections.length;
    },
    getAllPageCount: async () => { 
        const pages = await shopify.page.list();
        return pages.length; 
    },
    getProduct: async (filterOptions = {}, sortOption = {}, cursor = null, limit = 10) => { 
        
        const query = `{
                products(first: ${limit}, after: ${cursor ? `"${cursor}"` : null}) {
                edges {
                    node {
                    id
                    handle
                    title
                    tags
                    productType
                    images(first: 1) {
                        edges {
                        node {
                            src
                        }
                        }
                    }
                    metafields(first: 250, namespace: "global") {
                        edges {
                        node {
                            key
                            namespace
                            value
                        }
                        }
                    }
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
                }
            }`;
          
        const products = await shopify.graphql(query); 
        return products;
    },
    getCollections: async (filterOptions = {}, sortOption = {}, cursor = null, limit = 10) => { 
        
        const query = `{
                        collections(first: ${limit}, after: ${cursor ? `"${cursor}"` : null}) {
                            edges {
                                node {
                                id
                                title
                                handle
                                descriptionHtml
                                image {
                                    src
                                    altText
                                }
                                metafields(first: 250) {
                                    edges {
                                    node {
                                        key
                                        value
                                        namespace
                                    }
                                    }
                                }
                                }
                            }
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                        }
                    }`;
          
        const collections = await shopify.graphql(query); 
        return collections;
    }, 
    getPages: async () => { 
        // const query = `{
        //         shop {
        //             pages(first: ${limit}, after: ${cursor ? `"${cursor}"` : null}) {
        //                 edges {
        //                     node {
        //                         id
        //                         title
        //                         bodyHtml
        //                         handle
        //                         createdAt
        //                         updatedAt
                                
        //                     }
        //                 } 
        //                 pageInfo {
        //                     hasNextPage
        //                     endCursor
        //                 }
        //             }
        //         }
        //     }`;

        const pages = await  shopify.page.list({ limit: 250 });
        
          
        // const pages = await shopify.page(query); 
        return pages;
    },
    getPagesMetafields: async (page_id) => { 
         
 
        const page_metafield = shopify.metafield.list({metafield: { owner_resource: 'page', owner_id: page_id }})
           
        return page_metafield;
    }

}

module.exports = ShopifyApi;