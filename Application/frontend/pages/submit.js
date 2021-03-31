import Head from 'next/head'
import Layout from '../components/layout'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'

export default function Submit({ Component }) {
    const [certid, setCertid] = useState ('');
    const [OTP, setOTP] = useState ('');
    const [loggedIn, setLoggedIn] = useState (null);

    let [OTPGenerated, setOTPGenerated] = useState('');

    const router = useRouter();

    const OTPGenerator = () => {
        var partialOTP = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 5; i++)
           partialOTP += characters.charAt(Math.floor(Math.random() * charactersLength));
        return partialOTP;
    }

    useEffect( () => {
        setLoggedIn(window.localStorage.getItem('token') != null);
        const result = OTPGenerator();
        setOTPGenerated(result);
    }, [])

    let onSubmit = async () => {
        const certidStorage = window.localStorage.getItem('certid');

        if (certidStorage === certid && OTP === OTPGenerated) {
            const response = await fetch('https://api.rcd.debug.ovh/profile/' + certidStorage, {
                method: 'POST',
                headers: {
                    'authorization': window.localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
            });
            const json = await response.json();
            router.push('/profile/' + certidStorage);
        }
        else {
            alert('Wrong OTP or Fiscal Code inserted! Please check again.')
        }
    };

    return loggedIn == null ? // prevents from having bad rendering on-the-fly
        (
            <Layout></Layout> 
        )
        : 
        !loggedIn ?
        (<Layout>
            <Row className="p-2">
                <Col className="container">
                    <Card className="bg-danger text-light text-center p-4">
                        This page is private. You must sign in before using it.
                    </Card>
                </Col>
            </Row>
        </Layout>
        ) : (
        <Layout>
        <Head>
            <title>Fake-INPS - Insert data for citizenship income request</title>
        </Head>
            <Container className="p-1">
                <Card className="colorPrimaryFake">
                    <Row className="p-2">
                        <Col md={3}></Col>
                        <Card className="col-6 align-self-center">
                            <Card.Body>
                                <h3 className="card-title">Insert data</h3>
                                <p className="card-text">Insert your data to submit your citizenship income request</p>
                                <p className="card-text text-secondary">Here is your One Time Password: <code>{OTPGenerated}</code></p>
                                <form id="data-submit-form" method="post" action="javascript:void(0)">
                                    <div className="input-group mb-3">
                                        <input type="text" id="certid" name="certid" className="form-control" placeholder="Fiscal Code" required
                                            onChange={() => setCertid(event.target.value)} maxLength="16" />
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="password" id="otp" name="otp" className="form-control" placeholder="One Time Password (OTP)"
                                            onChange={() => setOTP(event.target.value)} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" onClick={() => onSubmit()}>Submit</button>
                                </form>
                            </Card.Body>
                        </Card>
                        <Col md={3}></Col>
                    </Row>
                </Card>
            </Container>
        </Layout>
    )
}
