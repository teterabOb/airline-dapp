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
});