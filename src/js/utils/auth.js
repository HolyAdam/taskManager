export default function authWithData(email, password) {
	const apiKey = 'AIzaSyCIUUavq5OHjsG-VIpJ_0iy0Mk38eXJT7s'

	return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
		method: 'POST',
		body: JSON.stringify({
			email,
			password,
			returnSecureToken: true
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(response => response.json())

	
}