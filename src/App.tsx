//파이어베이스에서는 collection : table, doc : row, field : row안의 column
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import "./App.css";
import { useState, useEffect } from "react";
import { db } from "./firebase-config";

type User = {
  id: string;
  name: string;
  age: number;
};

type UlProps = {
  users: any 
  setUsers:any
};

type LiProps = {
  user: any 
  index:number
};

function App() {
  function Ul({users,setUsers}:UlProps){
    function Li({user, index}:LiProps){
      let [form, setForm] = useState(false);
      return(
            <div key={index}>
              {" "}
              <div>Name: {user.name}</div>
              <div>Age: {user.age}</div>
              <button
              className="button"
                onClick={() => {
                  increaseAge(user.id, user.age, index);
                }}
              >
                Increase Age
              </button>
              <button
              className="button"
                onClick={() => {
                  decreaseAge(user.id, user.age, index);
                }}
              >
                Decrease Age
              </button>
              <button
              className="button"
                onClick={() => {
                  deleteUser(user.id);
                }}
              >
                Delete User
              </button>
              <div>
                <button
                className="button"
                  onClick={() => {
                    setForm(form ? false : true);
                  }}
                >{`Edit Name & Age`}</button>
                {form ? (
                  <form
                    onSubmit={(e) => updateName(e, user.id, user.age, index)}
                  >
                    <input
                      type="text"
                      onChange={(e) => {
                        setChangedName(e.target.value);
                      }}
                      placeholder={user.name}
                    />
                    <input
                    className="inputtext"
                      style={{ display: "hidden" }}
                      type="submit"
                      value="이름변경"
                    />
                  </form>
                ) : 
                null}
              </div>
            </div>
      )
    }

    const [changedName, setChangedName] = useState<string>("");
    

        //update. 버튼 클릭시 인풋창 두개가 생기고 각각 나이, 이름을 바꿀수 있게 설정. 둘중 하나가 비면 빈거는 원래값 그대로 들어가게 설정.

    //**********************UPDATE sector********************************

    const increaseAge = async (id: string, age: number, index: number) => {
      const userDoc = doc(db, "users", id);
      const newFields = { age: age + 1 };
      await onSnapshot(doc(db, "users", id), (doc) => {
        let getName = doc.data()!.name;
        const newUser = {
          id,
          name: getName,
          age: age + 1,
        };
        setUsers([
          ...users.slice(0, index),
          newUser,
          ...users.slice(index + 1, users.length),
        ]);
      });

      await updateDoc(userDoc, newFields); //doc 수정시 updateDoc(기존doc, 수정사항 적힌 객체 자료형)
    };

    const decreaseAge = async (id: string, age: number, index: number) => {
      const userDoc = doc(db, "users", id);
      let num = age > 0 ? age - 1 : 0;
      const newFields = { age: num };

      await onSnapshot(doc(db, "users", id), (doc) => {
        let getName = doc.data()!.name;
        const newUser = {
          id,
          name: getName,
          age: num,
        };

        // setUsers([...users, newUser]);
        setUsers([
          ...users.slice(0, index),
          newUser,
          ...users.slice(index + 1, users.length),
        ]);
      });

      await updateDoc(userDoc, newFields); //doc 수정시 updateDoc(기존doc, 수정사항 적힌 객체 자료형)
    };

    const updateName = async (
      e: any,
      id: string,
      age: number,
      index: number
    ) => {
      //changedName
      e.preventDefault();
      alert(`변경된 이름: ${changedName}`);
      const userDoc = doc(db, "users", id);

      const newFields = { name: changedName };

      await onSnapshot(doc(db, "users", id), (doc) => {
        // let getName = doc.data()!.name;
        const newUser = {
          id,
          name: changedName,
          age: age,
        };

        // setUsers([...users, newUser]);
        setUsers([
          ...users.slice(0, index),
          newUser,
          ...users.slice(index + 1, users.length),
        ]);
      });

      await updateDoc(userDoc, newFields);
    };

    //**********************UPDATE sector********************************

    //delete
    const deleteUser = async (id: string) => {
      const userDoc = doc(db, "users", id);
      users.map((user:any) => {
        if (user.id === id) {
          setUsers(users.filter((e:any) => e !== user));
        }
      });
      await deleteDoc(userDoc);
    };
    return(
      <ul>
              {users.map((user:any, index: number) => {
          return (
            <Li user={user} index={index}></Li>
          );
        })}</ul>
    )
  }
  function Todo() {

    const [newName, setNewName] = useState<string>("");
    
    const [newAge, setNewAge] = useState<number>(0);
    const [users, setUsers] = useState<User[]>([]); //users는 [{id:"",name:"",age:},{},...] 형태의 자료형.

    const usersCollectionRef = collection(db, "users"); //users이름의 콜렉션(자료들을 모아놓은 자료구조)

    //create
    const createUser = async () => {
      const result = await addDoc(usersCollectionRef, {
        name: newName,
        age: newAge,
      }); //addDoc(저장할 콜렉션, 들어갈 자료형 기입)
      //result==={converter:null, _key:,firestore:,id,...}등으로 이뤄진 객체
      const newUser = {
        id: result.id,
        name: newName,
        age: newAge,
      };
      await setUsers((users) => [...users, newUser]); //비동기 함수를 사용하는 이유?
    };



    //얘가 read다
    useEffect(() => {
      const getUsers = async () => {
        const data = await getDocs(usersCollectionRef);
        //data.docs에는 doc들이 들어있다.
        data.docs.map((doc) => {
          let result = {
            id: doc.id,
            name: doc.data().name,
            age: doc.data().age,
          };
          setUsers((users) => [...users, result]);
        });
      };
      getUsers();
    }, []);
    return (
      <div className="formcase">
        <input className="button"
          placeholder="Name..."
          onChange={(e) => {
            setNewName(e.target.value);
          }}
        />
        <input className="button"
          type="number"
          placeholder="Age..."
          onChange={(e) => {
            setNewAge(parseInt(e.target.value));
          }}
        />
        <button className="button" onClick={createUser}>Create User</button>
        {users?<Ul users={users} setUsers={setUsers}/>:null}


      </div>
    );
  }

  return (
    <div className="App bigcase">
      <Todo />
    </div>
  );
}

export default App;
