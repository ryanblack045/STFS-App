import { getTransactionData } from '../../services/fetch'
import { useState, useEffect } from 'react'
import  './Table.css'

function Table() {
  const [transactionArray, setTransactionArray] = useState(null); // an array of objects to update the displayed transaction data
  const [formBankName, setFormBankName] = useState(""); // state for input form for new rows
  const [formFirstName, setFormFirstName] = useState(""); // ^^
  const [formLastName, setFormLastName] = useState(""); // ^^
  const [formBalance, setFormBalance] = useState(""); // ^^
  const [formMinPayPercent, setFormMinPayPercent] = useState("") //^^
  const [showForm, setShowForm] = useState(false) // state to display the form or not
  const [submittedForm, setSubmittedForm] = useState(false) // state that helps with storing (local storage) new transasction array after form submission
  const [checkedState, setCheckedState] = useState([]); // state that decides when a checkbox is checked
  const [totalBalance, setTotalBalance] = useState(0) // keeps track of total balance of checked rows
  const [sumBox, setSumBox] = useState(false) // state for the checkbox that checks all of the checkboxes at once
  const [totalChecked, setTotalChecked] = useState(0) // state for total checkboxes checked

  useEffect(() => {
    /* This useEffect is running everytime someone adds a row
    so that we can persist the data via local storage.

    If there is no "data" we create an array on coponent mount and push the data that comes
    back from the fetch into the array, then we set that array to a local slice of state
    for rendering purposes

    Also when a new row is submitted we store the new transaction array to local storage
    */

    if (submittedForm) {
      window.localStorage.setItem('data', JSON.stringify(transactionArray))
      setSubmittedForm(false)
    }

    let data = JSON.parse(window.localStorage.getItem('data'))

    if (data) {
      console.log("data exist")
      setTransactionArray(data)
      setCheckedState(new Array(data.length).fill(false))
    } else {
      let tempArray = []
      async function fetchAPI() {
        let array = await getTransactionData('https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json')
        array.forEach(element => tempArray.push(element))
        setTransactionArray(tempArray)
        if(transactionArray) setCheckedState(new Array(tempArray.length).fill(false))
        console.log(transactionArray, "")
        window.localStorage.setItem('data', JSON.stringify(transactionArray))
      }
      fetchAPI()
    }
  }, [submittedForm]);


  const handleOnChange = (position) => {
    // keeps track of checked boxes and when a checkbox has been checked
    let count = 1
    const updatedCheckedState = checkedState.map((item, index) => {
      if(item) count++
     return index === position ? !item : item
    }
    );

    setTotalChecked(count)
    setCheckedState(updatedCheckedState)

    // if the checkbox has been checked, grab the balance of that specic rows balance and add it to the total balance state
    const totalPrice = updatedCheckedState.reduce(
      (sum, currentState, index) => {
        if (currentState === true) {
          return sum + transactionArray[index].balance;
        }
        return sum;
      },
      0
    );
    setTotalBalance(totalPrice)
  }

  /* when we remove a row, make a shallow copy of the transaction array and modify that then
  we store in local storage after that we change the size of the checkedState array to avoid errors.
  */
  function removeRow() {
    let copyTransactionArray = [...transactionArray]
    copyTransactionArray = copyTransactionArray.slice(0, copyTransactionArray.length - 1)
    setTransactionArray(copyTransactionArray)
    window.localStorage.setItem('data', JSON.stringify(copyTransactionArray))
    setCheckedState(new Array(copyTransactionArray.length).fill(false))
  }

  function saveRow() {
    //instead of error handling just setting values if user forgets to
    // adding new row object to the json data object
    setTransactionArray([...transactionArray, {
      "balance": formBalance ? parseInt(formBalance.replace(/\D/, "")) : 0,
      "creditorName": formBankName ? formBankName : "N/A",
      "firstName": formFirstName ? formFirstName : "N/A",
      "id": transactionArray.length + 1,
      "lastName": formLastName ? formLastName : "N/A",
      "minPaymentPercentage": formMinPayPercent ?parseInt(formMinPayPercent.replace(/\D/, "")) : 0,
    }])

    //reseting slices of state after form submission
    setShowForm(false)
    setFormBankName("");
    setFormFirstName("");
    setFormBalance("");
    setFormMinPayPercent("");
    setFormLastName("");
    setSubmittedForm(true)

  }


  //sets all of the checkboxes to checked when the check all box has been checked
  function sumAll() {
    let allCheckedState
    if (!sumBox) {
      allCheckedState = checkedState.map(checkBox =>
        true
      )
      setTotalChecked(checkedState.length)
      setSumBox(!sumBox)
    } else {
      allCheckedState = checkedState.map(checkBox =>
      false
      )
      setTotalChecked(0)
      setSumBox(!sumBox)
    };

  setCheckedState(allCheckedState)

  const totalPrice = allCheckedState.reduce(
    (sum, currentState, index) => {
      console.log(index, "index")
      if (currentState === true) {
        return sum + transactionArray[index].balance;
      }
      return sum;
    },
    0
  );
  setTotalBalance(totalPrice)
  console.log(totalBalance, "balance")
}

    return (
      <div className="App">
        <table >
          <thead>
            <tr>
              <th className="hcbx">
                <input
                  className="cbx"
                  type="checkbox"
                  value={sumBox}
                  onChange={() => sumAll(sumBox)}
                />
              </th>
              <th className="al">Creditor</th>
              <th className="al">First Name</th>
              <th className="al">Last Name</th>
              <th className="ar minPay">Min<br></br> Pay%</th>
              <th className="ar">Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactionArray?.map((transaction, index )=> {
              return (
                <tr>
                  <td className="hcbx">
                    <input
                      type="checkbox"
                      id={`custom-checkbox-${index}`}
                      name={transaction.id}
                      value={transaction.balance}
                      checked={checkedState[index]}
                      onChange={() => handleOnChange(index)} />
                  </td>
                  <td className="al" >{transaction.creditorName}</td>
                  <td className="al">{transaction.firstName}</td>
                  <td className="al">{transaction.lastName}</td>
                  <td className="ar">{parseInt(transaction.minPaymentPercentage).toFixed(2)}</td>
                  <td className="ar">${parseInt(transaction.balance).toFixed(2)}</td>
                </tr>
              )
            })}
            {showForm ?
              <tr>
                <td>
                  <button onClick={() => saveRow()}>Save</button>
                </td>
                <td>
                  <input
                    placeholder="Bank name"
                    value={formBankName} onChange={(e) => setFormBankName(e.target.value)} />
                </td>
                <td>
                  <input
                    placeholder="Your first name"
                    value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} />
                </td>
                <td>
                  <input
                    placeholder="Your last name"
                    value={formLastName} onChange={(e) => setFormLastName(e.target.value)} />
                </td>
                <td>
                  <input
                    placeholder="Set min %"
                    value={formMinPayPercent} onChange={(e) => setFormMinPayPercent(e.target.value)} />
                </td>
                <td>
                  <input
                    placeholder="Set balance"
                    value={formBalance} onChange={(e) => setFormBalance(e.target.value)} />
                </td>
              </tr> : null}
          </tbody>
          <tfoot>
            <div>
              {!sumBox ?
                <button onClick={() => removeRow()}>Remove Debt</button>
                :
                null
              }
            </div>
            {!showForm && !sumBox?
              <div  className={"al"} >
                <button onClick={() => setShowForm(true)}>Add Debt</button>
              </div>
              : null}
          </tfoot>
        </table>
        <table className="totalRow">
          <body>
          <tr style={{ backgroundColor: "lightblue", fontWeight: "bold"}} >
              <td style={{border:"none", width:"300px"}}>Total</td>
              <td style={{border:"none", width:"200px"}}></td>
              <td style={{border:"none", width:"1000px"}}></td>
              <td style={{border:"none", width:"120px"}}></td>
              <td style={{border:"none", width:"120px"}}></td>
              <td style={{ border: "none", fontWeight: "bold", width: "120px" }}
                className="ar">${parseInt(totalBalance).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colspan="2" className="rowCount al">Total Row Count:{transactionArray?.length}</td>
              <td colspan="3" className="rowCount al">Checked Row Count: {totalChecked}</td>
            </tr>
          </body>
        </table>

      </div>
    );
  }


export default Table;
