import { collection, getDocs, addDoc, updateDoc,doc, deleteDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "./firebase-config";

// interface User{
//   id:string,
//   name:string,
//   age:number,
// }
type User = {
  id:string,
  name:string,
  age:number,
}

function App() {
  const [newName, setNewName] =useState<string>("")
  const [newAge, setNewAge] =useState<number>(0)

  const [users, setUsers] = useState<User[]>([]);

  const usersCollectionRef = collection(db, "users");
  const deleteUser =async(id: string)=>{
    const userDoc = doc(db,"users",id)
    users.map((user)=>{
      if(user.id===id){
        setUsers(users.filter(e=>e!==user))
      }
    })
    await deleteDoc(userDoc)
  }

  const createUser =async()=>{
    const result = await addDoc(usersCollectionRef, {name:newName, age:newAge})
    console.log(result);
    let newUser = {
      id: result.id,
      name: newName,
      age: newAge
    }
    setUsers((users) => [...users, newUser])
  }
  const updateUser = async (id:string,age:number)=>{
    const userDoc=doc(db,"users",id)
    const newFields = {age:age+1}
    await updateDoc(userDoc,newFields)
  }

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersCollectionRef);
      data.docs.map((item) => {
        let result = {
          id: item.id,
          name: item.data().name,
          age: item.data().age
        }
        setUsers((users) => [...users, result])
      })
    }
    getUsers();
  }, [])
  
  return (
    <div className="App">
      <input placeholder="Name..." onChange={(e)=>{setNewName(e.target.value)}} />
      <input type="number" placeholder="Age..." onChange={(e)=>{setNewAge(parseInt(e.target.value))}} />
      <button onClick={createUser}>Create User</button>
      {users.map((user) => {
        console.log(user)
        return (
          <div key={user.id}>
            {" "}
            <h1>Name: {user.name}</h1>
            <h1>Age: {user.age}</h1>
            <button onClick={()=>{updateUser(user.id,user.age)}}>Increase Age</button>
            <button onClick={()=>{deleteUser(user.id)}}>Delete User</button>
          </div>
        );
      })}
    </div>
  );
}

export default App;
