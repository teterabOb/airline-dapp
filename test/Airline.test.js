const { ethers } = require("hardhat");
const { assert } = require("chai");

describe("Airline", () => {
  let instance;
  let accounts;

  beforeEach(async () => {
    const Airline = await ethers.getContractFactory("Airline");
    instance = await Airline.deploy();
    await instance.deployed();

    accounts = await ethers.getSigners();
  });

  it("should have available flights", async () => {
    let total = await instance.totalFlights();
    assert(total > 0);
  });

  it("should allow customer to buy a flight providing its value", async () => {
    let flight = await instance.flights(0);
    let flightName = flight.name;
    let price = flight.price;

    await instance.buyFlight(0, { value: price });
    let customerFlight = await instance.customerFlights(accounts[0].address, 0);
    let customerTotalFlights = await instance.customerTotalFlights(accounts[0].address);

    console.log("customerTotalFlights.toString() : ", customerTotalFlights.toString());
    console.log("PRICE : ", customerFlight.price);

    assert.equal(customerFlight.name, flightName);
    assert.equal(customerFlight.price.toString(), price);
    assert.equal(customerTotalFlights.toString(), "1");
  });

  it("should not allow customers to buy flights under the price", async () => {
    let flight = await instance.flights(0);
    let price = flight.price - 5000;
    try {
      await instance.buyFlight(0, { value: price });
    } catch (e) {
      return;
    }
    assert.fail();
  });

  it("should get the real balance of the contract", async () => {
    let flight = await instance.flights(0);
    let price = flight.price;

    let flight2 = await instance.flights(1);
    let price2 = flight2.price;

    await instance.buyFlight(0, { value: price });
    await instance.buyFlight(1, { value: price2 });

    let newAirlineBalance = await instance.getAirlineBalance();

    assert(newAirlineBalance.eq(price.add(price2)), "Incorrect balance");
  });

  it("should allow customers to redeem loyalty points", async () => {
    let flight = await instance.flights(1);
    let price = flight.price;

    await instance.buyFlight(1, { value: price });

    let balance = await ethers.provider.getBalance(accounts[0].address);
    await instance.redeemLoyaltyPoints({ from: accounts[0].address });
    let finalBalance = await ethers.provider.getBalance(accounts[0].address);

    let customer = await instance.customers(accounts[0].address);
    let loyaltyPoints = customer.loyaltyPoints;

    assert.equal(loyaltyPoints, 0);
    assert(finalBalance > balance);
  });
});
