const { default: Web3 } = require("web3");

const Airline = artifacts.require('Airline');

let instance;

beforeEach(async() => {
    instance = await Airline.new();    
});

contract('Airline', (accounts) => {
    it('should have available flights', async() => {
        let total = await instance.totalFlights();
        assert(total > 0);
    });

    it('should allow customer to buy a flight providing its value', async() =>{
        let flight = await instance.flights(0);
        let flightName = flight[0], price = flight[1];
        //console.log(flight);
        
        await instance.buyFlight(0, { from: accounts[0], value: price });
        let customerFlight = await instance.customerFlights(accounts[0], 0);
        let customerTotalFlights = await instance.customerTotalFlights(accounts[0]);
        //console.log(customerFlight, customerTotalFlights);

        assert(customerFlight[0], flightName);
        assert(customerFlight[1], price);
        assert(customerTotalFlights, 1);
    });

    it('it should now allow customers to buy flights under the price', async () => {
        let flight = await instance.flights(0);
        let price = flight[1] - 5000;
        try{    
            await instance.buyFlight(0, {from: accounts[0], value: price });
        }
        catch (e) { return; }
        assert.fail();
    });

    it('it should get the real balance of the contract', async() => {

        let flight = await instance.flights(0);
        let price = flight[1];

        let flight2 = await instance.flights(1);
        let price2 = flight2[1]; 

        await instance.buyFlight(0, { from: accounts[0], value: price });
        await instance.buyFlight(1, { from: accounts[0], value: price2 });

        let newAirlineBalance = await instance.getAirlineBalance();

        assert.equal(newAirlineBalance.toNumber(), price.toNumber() + price2.toNumber());
    });

    it('should allow customers to redeem loyalty points', async() => {
        let flight = await instance.flights(1);
        let price = flight[1];

        await instance.buyFlight(1, {from: accounts[0], value: price });

        let balance = await Web3.eth.getBalance(accounts[0]);
        await instance.redeemLoyaltyPoints({ from: accounts[0] });
        let finalBalance = await Web3.eth.getBalance(accounts[0]);

        let customer = await instance.customers(accounts[0]);
        let loyaltyPoints = customer[0];

        assert(loyaltyPoints, 0);
        assert(finalBalance > balance);
    });
});