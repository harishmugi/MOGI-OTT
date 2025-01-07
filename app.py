from flask import Flask, request, jsonify
from flask_cors import CORS  # Importing CORS

app = Flask(__name__)
CORS(app)  # This will allow all domains to access your API

@app.route('/api/voice_command', methods=['POST'])
def voice_command():
    # Extract the command from the POST request
    data = request.get_json()
    command = data.get('command', '')

    response = {
        'response': 'I didn\'t understand that command.'  # Default response
    }

    # Handle voice command here
    if 'play' in command.lower():
        response['response'] = 'play'
    elif 'pause' in command.lower():
        response['response'] = 'pause'
    elif 'stop' in command.lower():
        response['response'] = 'stop'
    elif 'forward' in command.lower():
        response['response'] = 'forward 10'  # Example for 10 seconds forward
    elif 'backward' in command.lower():
        response['response'] = 'backward 10'  # Example for 10 seconds backward
    elif 'volume up' in command.lower():
        response['response'] = 'volume_up 0.1'  # Example for increasing volume by 0.1
    elif 'volume down' in command.lower():
        response['response'] = 'volume_down 0.1'  # Example for decreasing volume by 0.1

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
