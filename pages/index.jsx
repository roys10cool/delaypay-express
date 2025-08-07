import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from "@/firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function HomePage() {
  const [claims, setClaims] = useState([]);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [claimForm, setClaimForm] = useState({
    trainCompany: "",
    from: "",
    to: "",
    scheduledTime: "",
    delayDuration: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) fetchClaims(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchClaims = async (uid) => {
    const q = query(collection(db, "claims"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setClaims(data);
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        authForm.email,
        authForm.password
      );
      setUser(userCredential.user);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        authForm.email,
        authForm.password
      );
      setUser(userCredential.user);
    } catch (error) {
      alert(error.message);
    }
  };

  const submitClaim = async () => {
    try {
      const newClaim = {
        ...claimForm,
        userId: user.uid,
        status: "Pending",
        submittedAt: new Date().toISOString()
      };
      await addDoc(collection(db, "claims"), newClaim);
      fetchClaims(user.uid);
      alert("Claim submitted! You'll get an email confirmation shortly.");
    } catch (err) {
      alert("Error submitting claim");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-pink-700 mb-2">DelayPay Express 🚂💸</h1>
          <p className="text-lg text-gray-700">
            All your train delay refunds in one fun, easy place!
          </p>
        </header>

        <Tabs defaultValue="claim">
          <TabsList className="bg-pink-100 p-2 rounded-xl">
            <TabsTrigger value="claim">Claim Refund</TabsTrigger>
            <TabsTrigger value="account">My Account</TabsTrigger>
          </TabsList>

          <TabsContent value="claim">
            <Card className="mt-6 bg-white rounded-2xl shadow-xl p-6">
              <CardContent>
                <h2 className="text-2xl font-semibold text-pink-600 mb-4">
                  Make a Claim
                </h2>
                {user ? (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <Input placeholder="Train Company" onChange={(e) => setClaimForm({ ...claimForm, trainCompany: e.target.value })} />
                    <Input placeholder="From Station" onChange={(e) => setClaimForm({ ...claimForm, from: e.target.value })} />
                    <Input placeholder="To Station" onChange={(e) => setClaimForm({ ...claimForm, to: e.target.value })} />
                    <Input type="datetime-local" onChange={(e) => setClaimForm({ ...claimForm, scheduledTime: e.target.value })} />
                    <Input type="number" placeholder="Delay Duration (minutes)" onChange={(e) => setClaimForm({ ...claimForm, delayDuration: e.target.value })} />
                    <Button onClick={submitClaim} className="bg-pink-500 hover:bg-pink-600 text-white">
                      Submit Claim
                    </Button>
                  </form>
                ) : (
                  <p className="text-gray-700">Please sign in to submit a claim.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="mt-6 bg-white rounded-2xl shadow-xl p-6">
              <CardContent>
                <h2 className="text-2xl font-semibold text-pink-600 mb-4">My Claims</h2>
                {user ? (
                  claims.map((claim) => (
                    <div key={claim.id} className="p-4 border-b border-gray-200 text-gray-800">
                      <p className="font-medium">{claim.trainCompany}: {claim.from} → {claim.to}</p>
                      <p className="text-sm">Status: {claim.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">Please sign in to view your claims.</p>
                )}
              </CardContent>
            </Card>

            {!user && (
              <Card className="mt-6 bg-white rounded-2xl shadow-xl p-6">
                <CardContent>
                  <h2 className="text-2xl font-semibold text-pink-600 mb-4">Create Account / Sign In</h2>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <Input placeholder="Email Address" onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                    <Input placeholder="Password" type="password" onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                    <div className="flex space-x-2">
                      <Button onClick={handleSignUp} className="bg-pink-500 hover:bg-pink-600 text-white">
                        Sign Up
                      </Button>
                      <Button onClick={handleSignIn} className="bg-purple-500 hover:bg-purple-600 text-white">
                        Sign In
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}