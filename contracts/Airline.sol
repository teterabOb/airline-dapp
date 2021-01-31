pragma solidity ^0.4.23;

contract Airline {
    address public owner;
    
    struct Customer{
        uint loyaltyPoints;
        uint totalFlights;
    }

    struct Flight{
        string name;
        uint price;
    }

    uint etherPerPoint = 0.5 ether;

    Flight[] public flights;

    mapping(address => Customer) public customers;
    mapping(address => Flight[]) public customerFlights;
    mapping(address => uint) public customerTotalFlights;

    event FlightPurchased(address indexed customer, uint price);

    constructor() public{
        owner = msg.sender;
        flights.push(Flight('Tokyo', 4 ether));
        flights.push(Flight('Germany', 1 ether));
        flights.push(Flight('Santiago', 3 ether));
    }

    function buyFlight(uint flightIndex) public payable{
        Flight flight = flights[flightIndex];
        require(msg.value == flight.price);

        Customer storage customer = customers[msg.sender];
        customer.loyaltyPoints += 5;
        customer.totalFlights += 1;
        customerFlights[msg.sender].push(flight);
        customerTotalFlights[msg.sender] ++;

        FlightPurchased(msg.sender, flight.price);
    }

    function totalFlights() public view returns (uint){
        return flights.length;
    }

    function redeemLoyaltyPoints() public{
        Customer storage customer = customers[msg.sender];
        uint etherToRefund = etherPerPoint * customer.loyaltyPoints;
        msg.sender.transfer(etherToRefund);
        customer.loyaltyPoints = 0;
    }

    function getRefundableEther() public view returns (uint){
        return etherPerPoint * customers[msg.sender].loyaltyPoints;
    }

    function getAirlineBalance() public view returns (uint){
        //al ocupar this instancio la misma direccion del contrato
        address airlineAddress = this;
        return airlineAddress.balance;
    }

    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }


}