import Web3 from 'web3';

const getWeb3 = () => {
    return new Promise( (resolve, reject) => {
        window.addEventListener('load', function() {
            let web3 = window.web3;
            //let web3 = window.ethereum;

            if(typeof web3 !== undefined){
                web3 = new Web3(web3.currentProvider);
                //web3 = new Web3(window.ethereum);
                resolve(web3);
            }
            else{
                console.error("No provider found, please install Metamask");
                reject();
            }
        });
    });
}

export default getWeb3;