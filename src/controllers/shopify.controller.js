'use strict';
// const Dashboard = require('../models/dashboard.model'); 
// const bcrypt = require('bcrypt');
const ShopifyApi = require('../helpers/shopify.helpers');


const getProductCursorForPage = async (page, limit) => { 
  let cursor = null;
  for (let i = 0; i < page; i++) {
      const products_api = await ShopifyApi.getProduct({}, {}, cursor, limit);
      if (products_api.products.pageInfo.hasNextPage) { 
          cursor = products_api.products.pageInfo.endCursor; 
      } else {
          break;
      }
  }
  return cursor;
}

exports.getProducts = async (req, res) => {
  try {
      var startUrl = req.session.customer.site_url;
      const page = req.query.page;
      const limit = req.query.limit ? req.query.limit : 25 ;  
     
      const total_products_api = await ShopifyApi.getAllProductCount();
      const cursor = page > 1 ? await getProductCursorForPage(page - 1, limit) : null;
      const products_api = await ShopifyApi.getProduct({}, {}, cursor, limit);
      
      const final_data = products_api.products.edges.map(edge => { 
        const product = edge.node; 
        const metaTitle = product.metafields.edges.find(mf => mf.node.key === 'title_tag')?.node.value || null;
        const metaDescription = product.metafields.edges.find(mf => mf.node.key === 'description_tag')?.node.value || null;
        return {
            id: product.id,
            handle: product.handle,
            title: product.title,
            tags: product.tags,
            productType: product.productType,
            image: product.images.edges[0]?.node.src || null,
            metaTitle: metaTitle,
            metaDescription: metaDescription,
            productUrl: startUrl + "/products/" + product.handle
        };
      });
      res.status(200).json({ 
        success: true,
        filterProducts:final_data.length,
        totalProducts: total_products_api,
        hasNextPage: products_api.products.pageInfo.hasNextPage,
        final_data: final_data 
      });
  } catch (err) { 
      return res.status(500).json({ message: 'Something wrong........', error: err.message });

  }
}

exports.shopifyProducts = async function (req, res) {
  res.render('shopify/products');
};


const getCollectionsCursorForPage = async (page, limit) => { 
  let cursor = null;
  for (let i = 0; i < page; i++) {
      const collections_api = await ShopifyApi.getCollections({}, {}, cursor, limit);
      if (collections_api.collections.pageInfo.hasNextPage) { 
          cursor = collections_api.collections.pageInfo.endCursor; 
      } else {
          break;
      }
  }
  return cursor;
}

exports.getCollections = async (req, res) => {
  try {
      var startUrl = req.session.customer.site_url;
      const page = req.query.page;
      const limit = req.query.limit ? req.query.limit : 25 ;  
     
      const total_collections_api = await ShopifyApi.getAllCollectionCount();
      const cursor = page > 1 ? await getCollectionsCursorForPage(page - 1, limit) : null;
       
      const collections_api = await ShopifyApi.getCollections({}, {}, cursor, limit);
      
      const final_data = collections_api.collections.edges.map(edge => {  
        const collection = edge.node;
        const metaTitle = collection.metafields.edges.find(mf => mf.node.key === 'title_tag')?.node.value || null;
        const metaDescription = collection.metafields.edges.find(mf => mf.node.key === 'description_tag')?.node.value || null; 
        return {
          id: collection.id,
          title: collection.title,
          handle: collection.handle,
          descriptionHtml: collection.descriptionHtml,
          image: collection.image ? collection.image.src : null,
          productsCount: collection.productsCount,
          metaTitle: metaTitle,
          metaDescription: metaDescription,
          collectionUrl: startUrl + "/collections/" + collection.handle
        }; 
      });
       
      res.status(200).json({ 
        success: true,
        filterCollections:final_data.length,
        totalCollections: total_collections_api,
        hasNextPage: collections_api.collections.pageInfo.hasNextPage,
        final_data: final_data 
      });
  } catch (err) { 
      return res.status(500).json({ message: 'Something wrong........', error: err.message });

  }
}

exports.shopifyCollections = async function (req, res) {
  res.render('shopify/collections');
};
 

// const getPagesCursorForPage = async (page, limit) => { 
//   let cursor = null;
//   for (let i = 0; i < page; i++) {
//       const pages_api = await ShopifyApi.getPages({}, {}, cursor, limit);
//       if (pages_api.pages.pageInfo.hasNextPage) { 
//           cursor = pages_api.pages.pageInfo.endCursor; 
//       } else {
//           break;
//       }
//   }
//   return cursor;
// }

exports.getPages = async (req, res) => {
  try { 
      var startUrl = req.session.customer.site_url;
      const pages_api = await ShopifyApi.getPages();
      const final_data = [];

      for (const page of pages_api) {
        // const metafieldsData = await ShopifyApi.getPagesMetafields(page.id); 
        // const metafields = metafieldsData.metafields || []; 
        // const metaTitle = metafields.find(mf => mf.key === 'title_tag')?.value || null;
        // const metaDescription = metafields.find(mf => mf.key === 'description_tag')?.value || null;
  
        final_data.push({
          id: page.id,
          title: page.title,
          handle: page.handle,
          bodyHtml: page.body_html,
          // metaTitle: metaTitle,
          // metaDescription: metaDescription,
          metaTitle: '',
          metaDescription: '',
          pageUrl: startUrl + "/pages/" + page.handle
        });
      } 
      
      res.status(200).json({ 
        success: true,
        filterPages:final_data.length, 
        final_data: final_data 
      });
  } catch (err) { 
      return res.status(500).json({ message: 'Something wrong........', error: err.message });

  }
}

exports.shopifyPages = async function (req, res) {
  res.render('shopify/pages');
};