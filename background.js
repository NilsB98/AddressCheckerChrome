chrome.runtime.onInstalled.addListener(() => {
    let options = {'minRiskScore': 2}
    chrome.storage.sync.set({options})
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                function: checkSelection,
            });
        }
    }
)


function checkSelection() {
    if (!this.selectionListenerExists) {
        document.body.addEventListener('mouseup', (event)=> {
            let warnBoxHidden = document.getElementById('cct-warnbox').hidden
            if (!warnBoxHidden) {
                return
            }

            let selection = window.getSelection().toString().trim()
            let coinRegExMap = {}

            coinRegExMap['BITCOIN'] = '^([13]|bc1)[a-zA-HJ-NP-Z0-9]{25,39}$'
            // TODO add further coins

            for (const [coin, regex] of Object.entries(coinRegExMap)) {
                if (selection.match(regex)) {
                    fetch(`http://217.160.46.55/api/risk/${selection}?coin=${coin}`)
                        .then(response => response.json())
                        .then(data => {
                            let score = data.riskScore
                            let warnText = ""
                            let warnHeader = ""
                            let boxColor = ""
                            let borderColor = ""

                            switch (true) {
                                case (score === 0):
                                    warnText = "This address was verified by the owner"
                                    boxColor = '#24ff32'
                                    borderColor = '#00a10b'
                                    break
                                case (score < 3):
                                    warnText = "Low Risk"
                                    warnHeader = "This address hasn't been found in any fraudulent context"
                                    boxColor = '#fffb3a'
                                    borderColor = '#b1ae00'
                                    break
                                case (score < 5):
                                    warnHeader = "Warning!"
                                    warnText = "The address appeared in a fraudulent context before."
                                    boxColor = '#ff3834'
                                    borderColor = '#d00600'

                                    break
                                case (score < 10):
                                    warnHeader = "Warning, High Risk!"
                                    warnText = "The address has been reportedly been" +
                                        " involved in a fraudulent context."
                                    boxColor = '#ff5534'
                                    borderColor = '#ce1c00'
                                    break
                                case (score === 10):
                                    warnHeader = "Alert, high Risk!"
                                    warnText = "The address is verified to be fraudulent!"
                                    boxColor = '#ff1111'
                                    borderColor = '#aa0000'
                                    break
                                default:
                                    warnText = "default"
                            }

                            let warnBox = document.getElementById('cct-warnbox')
                            let warnBoxHeader = document.getElementById('cct-warnbox-header')
                            let warnBoxTxt = document.getElementById('cct-warnbox-txt')
                            let warnBoxLink = document.getElementById('cct-warnbox-link')

                            warnBox.style.backgroundColor = boxColor;
                            warnBox.style.borderColor = borderColor;
                            warnBoxHeader.innerText = warnHeader;
                            warnBoxTxt.innerText = warnText;
                            warnBoxLink.href = `http://217.160.46.55/address/${selection}?search_type=adr`

                            console.log(`document min RiskScore: ${Options.minRiskScore}`)
                            console.log(`risk score: ${score}`)
                            if (Options.minRiskScore <= score){
                                warnBox.hidden = false;
                            }
                        });
                }
            }
            console.log(selection)
        })

        // add html element
        var template = document.createElement('div');
        var html = "<div id='cct-warnbox' style='position: fixed; right: 3rem; top:4rem;" +
            " text-align: center; border-radius: .5rem; background-color: aquamarine; padding:" +
            " 1rem; z-index: 999999; color: #151515;border-style: solid;border-width: 0.15rem;'" +
            " hidden>" +
            "<button id='cct-warnbox-hide' style='float: right; background: none; border:" +
            " none;cursor:" +
            " pointer' onclick='document.getElementById(`cct-warnbox`).hidden=true'>X</button>" +
            "<h2 id='cct-warnbox-header' style='margin: .5rem'>Warning!</h2>" +
            "<p id='cct-warnbox-txt' style='margin: .5rem'>The address was reported!</p>" +
            "<p style='margin: .5rem'>Check the <a id='cct-warnbox-link'" +
            " style='text-decoration: none; color: #000000'" +
            " href='http://217.160.46.55/'>CryptoCrimeTracker\t&copy;</a>" +
            "  for further details</p>"+
            "</div>"
        template.innerHTML = html
        document.body.insertBefore(template, document.body.firstChild);


        chrome.storage.sync.get('options', (data) => {
            window.Options = {}
            Object.assign(window.Options, data.options);
        });



        this.selectionListenerExists = true;
    }
}