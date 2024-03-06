import { User, getUser, createUser, updateUser, deleteUser, listUsers } from "../../dist/data/user.js"
import { Purchase, buyProduct } from "../../dist/data/purchase.js"
import { SplunkAgent } from "../../dist/data/agent.js"
import { Product, getProduct, createProduct, updateProduct, deleteProduct, listProducts } from "../../dist/data/product.js"
import { expect } from "chai";
import dotenv from 'dotenv'

function randStr(len) {
  const charset = "abcdefghijklmnopqrstuvwxyz";
  let result = '';
  for( let i=0; i < len; i++ ) {result += charset[Math.floor(Math.random() * charset.length)]};
  return result
}

let productId, username;
describe("Agent", () => {
  let myAgent

  const options = {
    serviceParams: {
      username: process.env.SPLUNK_USERNAME,
      password: process.env.SPLUNK_PASSWORD,
      scheme: process.env.SCHEME,
      host: process.env.HOST,
      port: process.env.PORT,
      version: process.env.VERSION
    }
  }

  const indicators = {
    "IP": [
      "45.61.138.109",
      "185.141.62.123",
      "5.199.169.209",
      "45.61.138.109:45815",
      "45.61.138.109:43937",
      "45.61.138.109:36931",
      "5.199.169.209:31600",
      "45.61.138.109:41703",
      "185.99.135.115:39839",
      "185.99.135.115:41773",
      "45.61.138.109:33971",
      "185.141.62.123:50810",
      "185.99.135.115:49196"
  ],
  "URL": [
      "http://185.141.62.123:10228/update.exe"
  ]
}

  it("login", async () => { 
    myAgent = new SplunkAgent(options)
    try {
      const login = await myAgent.login()
      console.log('login: ', login)
      expect(login).to.equal(true)
    } catch (err) {
      console.log('error: ', err)
    }
  });

  it("createAlert", async () => { 
    try {
        // alertOptions is an optional parameter...
      const alertOptions = {
        "alert_type": "always",
        "alert.severity": "2",
        "alert.suppress": "0",
        "alert.track": "1",
        "dispatch.earliest_time": "-1h",
        "dispatch.latest_time": "now",
        "is_scheduled": "1",
        "cron_schedule": "* * * * *"
      };
      const id = "01HKE1SZ77HDHZW4WJ94S04SAM"
      const alertName = 'Eric test 4'
      const createAlert = await myAgent.createAlert(alertName, id, indicators, alertOptions)
      console.log('createAlert: ', createAlert)
    } catch (err) {
      console.log('error: ', err.status)
      console.log('error: ', err.data)
      expect(err).to.equal(null)
    }
  });

  it("listAlerts", async () => { 
    try {
      const listAlerts = await myAgent.listAlerts()
      console.log('listAlerts: ', listAlerts)
    } catch (err) {
      console.log('error: ', err)
    }
  });

  it.skip("getSavedSearches", async () => { 
    try {
      const getSavedSearches = await myAgent.getSavedSearches()
      console.log('getSavedSearches: ', getSavedSearches)
    } catch (err) {
      console.log('error: ', err)
    }
  });

  it.skip("createSavedSearch", async () => { 
    try {
      const createSavedSearch = await myAgent.createSavedSearch('Clop TrendMicro Report', indicators)
      console.log('createSavedSearch: ', createSavedSearch)
    } catch (err) {
      console.log('error: ', err)
    }
  });

  it.skip("runSearch", async () => { 
    try {
      const runSearch = await myAgent.runSearch('rndsrchname3')
      console.log('runSearch: ', runSearch)
    } catch (err) {
      console.log('error: ', err)
    }
  });
})  

describe.skip("User", () => {

    username = randStr(9);
    const name = `${username.substring(0,5)} ${username.substring(5)}`;
    const nameNew = `${name} Esquire`
    const company = `${username}Corp`;
    const companyNew = `${company} V2`

  it("Create user", async () => { 
    const user = new User(undefined, username, name, company);
    const userKeys = user.keys();
    expect(userKeys.PK).to.equal(`USER#${username}`);
    expect(userKeys.SK).to.equal(`USER#${username}`);
    const result = await createUser(user);
    console.log('user: ', user)
    expect(result.httpStatusCode).to.equal(200);
  });

  it("Check user keys", async () => {
    const user = new User('', username);
    const userKeys = user.keys();
    //console.log('userKeys: ', userKeys)
    expect(userKeys.PK).to.equal(`USER#${username}`);
    expect(userKeys.SK).to.equal(`USER#${username}`);
  });

  it("Get user", async () => {
    const result = await getUser(username);
    //console.log('Result: ', result)
    expect(result.username).to.equal(username);
    expect(result.name).to.equal(name);
    expect(result.company).to.equal(company);
  });

  it("Update user", async () => {
    const user = await getUser(username);
    //console.log('user: ', user)
    await updateUser(new User(user.id, username, nameNew, companyNew));
    const updatedUser = await getUser(username);
    expect(updatedUser.username).to.equal(username);
    expect(updatedUser.name).to.equal(nameNew);
    expect(updatedUser.company).to.equal(companyNew);
  });

  it("List users", async () => {
    try {
      const users = await listUsers();
      //console.log('users: ', users)
      const newUser = users.find((element) => element.username === username)
      expect(newUser.username).to.equal(username);
      expect(newUser.company).to.equal(companyNew);
    } catch(err) {
      expect(err.toString()).to.equal('Error: No item!')
    }
  });

  it("Delete user", async () => {
    const result = await deleteUser(username);
    try {
      await getUser(username);
    } catch(err) {
      //console.log('err: ', err)
      expect(err.toString()).to.equal('Error: No item!')
    }
  });

});

describe.skip("Product", () => {

  let id, timestamp;
  const author = randStr(9);
  const title = `Zeta malware ${randStr(12)}`;
  const validators = [
    "0x1f6c8e2d7a3b5",
    "0x3d9a5c1e8f7b2",
    "0x5e8b7f1c3a2d9",
    "0x2d9f6a1c8b7e3",
    "0x7b8c3a1e5d2f6",
    "0x2f9d5b7c8e3a1"
  ]
  const downloads = 33;
  const rating = 4.2;
  const reference = `https://www.${author}.fakeweb/blog/${title}`
  const tags = [
    "Ransomware"
  ]
  const type = 'Indicators'
  const category = 'Ransomware'
  const indicators = {
    "IP": [
        "45.61.138.109",
        "185.141.62.123",
        "5.199.169.209"
    ],
    "URL": [
        "http://185.141.62.123:10228/update.exe"
    ]
  }
  const titleNew = `Super new Zeta malware ${randStr(12)}`;
  const validatorsNew = [
    "0x8d7c3a2b9e5f6",
    "0x2f5c1d8e7b3a9",
    "0x4e9d1f6a3c2b5",
    "0x5c8d3a1b9e7f2",
    "0x7b3e9d2f6c5a8",
    "0x8a7c3e5d9b2f1",
    "0x1f6c8e2d7a3b5",
    "0x3d9a5c1e8f7b2",
    "0x5e8b7f1c3a2d9",
    "0x2d9f6a1c8b7e3",
    "0x7b8c3a1e5d2f6",
    "0x2f9d5b7c8e3a1"
  ]
  const downloadsNew = 44;
  const ratingNew = 3.9;
  const referenceNew = `https://www.${author}new.fakeweb/blog/${title}`
  const tagsNew = [
    "Ransomware",
    "C2",
    "AlphV",
    "Scattered Spider",
    "Muddled Libra",
    "MGM",
    "Ceaser",
    "Network Traffic"
  ]
  const typeNew = 'IndicatorsV2'
  const categoryNew = 'Ransomwarexx'
  const indicatorsNew = {
    "IP": [
        randStr(9),
        "45.61.138.109",
        "185.141.62.123",
        "5.199.169.209",
        "45.61.138.109:45815",
        "45.61.138.109:43937",
        "45.61.138.109:36931",
        "5.199.169.209:31600",
        "45.61.138.109:41703",
        "185.99.135.115:39839",
        "185.99.135.115:41773",
        "45.61.138.109:33971",
        "185.141.62.123:50810",
        "185.99.135.115:49196"
    ],
    "URL": [
        "http://185.141.62.123:10228/original.exe",
        "http://185.141.62.123:10228/updated.exe"
    ],
    "MD5": [
      randStr(9),
      randStr(10)
    ]
  } 

  it("Create product", async () => { 
    const product = new Product(undefined, undefined, author, title, validators, downloads, rating, reference, tags, type, category, JSON.stringify(indicators))
    const productKeys = product.keys();
    //console.log('productKeys: ', productKeys);
    id = productKeys.PK.substring(5);
    expect(id.length).to.equal(26);
    const result = await createProduct(product);
    console.log('result: ', result)
    expect(result.httpStatusCode).to.equal(200);
  });

  it("Product Keys", async () => {
    const product = new Product(id, 0, '', '')
    const productKeys = product.keys();
    //console.log('productKeys: ', productKeys)
    expect(productKeys.PK).to.equal(`PROD#${id}`);
    expect(productKeys.SK).to.equal(`PROD#${id}`);
  });

  it("Get product", async () => {
    const result = await getProduct(id);
    timestamp = result.timestamp;
    console.log('result: ', result)
    productId = result.id;
    expect(result.id).to.equal(id);
    // expect(result.timestamp).to.be.greaterThan(111);
    // expect(result.timestamp).to.be.lessThan(111);
    expect(result.author).to.equal(author);
    expect(result.title).to.equal(title);
    expect(result.downloads).to.equal(downloads);
    expect(result.rating).to.equal(rating);
    expect(result.reference).to.equal(reference);
    expect(result.tags[0]).to.equal(tags[0]);
    expect(result.type).to.equal(type);
    //expect(result.indicators).to.equal(JSON.stringify(indicators));
  });

  it.skip("Update product", async () => {
    const product = await getProduct(id);
    await updateProduct(new Product(product.id, 0, author, titleNew, validatorsNew, downloadsNew, ratingNew, referenceNew, tagsNew, typeNew, categoryNew, JSON.stringify(indicatorsNew)));
    const result = await getProduct(id);
    //console.log('result: ', result)
    expect(result.id).to.equal(id);
    // expect(result.timestamp).to.be.greaterThan(111);
    // expect(result.timestamp).to.be.lessThan(111);
    expect(result.author).to.equal(author);
    expect(result.title).to.equal(titleNew);
    expect(result.downloads).to.equal(downloadsNew);
    expect(result.rating).to.equal(ratingNew);
    expect(result.reference).to.equal(referenceNew);
    expect(result.tags[0]).to.equal(tagsNew[0]);
    expect(result.type).to.equal(typeNew);
    //expect(result.indicators).to.equal(indicatorsNew);
  });

  it("List products", async () => {
    try {
      const products = await listProducts();
      //console.log('products: ', products)
      const foundProduct = products.find((element) => element.id === id)
      expect(foundProduct.author).to.equal(author);
      expect(foundProduct.title).to.equal(titleNew);
    } catch(err) {
      expect(err.toString()).to.equal('Error: No item!')
    }
  });

  it.skip("Delete product", async () => {
    const result = await deleteProduct(id);
    try {
      await getProduct(id);
    } catch(err) {
      expect(err.toString()).to.equal('Error: No item!')
    }
  });

});

describe.skip("Purchase", () => {

  it("Buy Product", async () => { 
    const purchase = new Purchase(undefined, productId, username);
    const result = await buyProduct(purchase);
    console.log('result: ', result)
    expect(result.httpStatusCode).to.equal(200);
  });
})