from flask import Flask, request, jsonify
from flask_cors import CORS  # Importing CORS
import re  # For extracting numbers from the command

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

    
    response = {}

    # Check if 'play' is in the command
    if 'play' in command.lower():
        response['response'] = 'play'
    
    # Check if 'pause' is in the command
    elif 'pause' in command.lower():
        response['response'] = 'pause'
    
    # Check if 'stop' is in the command
    elif 'stop' in command.lower():
        response['response'] = 'stop'
    
    # Check if 'forward' is in the command and extract seconds
    elif 'forward' in command.lower():
        # Extract the number of seconds after the word "forward"
        match = re.search(r'\d+', command)  # This will match the first number in the command
        if match:
            seconds = match.group(0)  # Get the first number found
            response['response'] = f'forward {seconds}'
        else:
            response['response'] = 'forward 10'  # Default to 10 seconds if no number is found
    
    # Check if 'backward' is in the command and extract seconds
    elif 'backward' in command.lower():                            
        # Extract the number of seconds after the word "backward"
        match = re.search(r'\d+', command)  # This will match the first number in the command
        if match:
            seconds = match.group(0)  # Get the first number found
            response['response'] = f'backward {seconds}'
        else:
            response['response'] = 'backward 10'  # Default to 10 seconds if no number is found
    
    # Check if 'volume up' is in the command and increase by 0.1
    elif 'volume up' in command.lower():
        response['response'] = 'volume_up 0.5'
    
    # Check if 'volume down' is in the command and decrease by 0.1
    elif 'volume down' in command.lower():
        response['response'] = 'volume_down 0.5'
    elif 'mute' in command.lower():
        response['response'] = 'volume_down 1'
    elif 'unmute' in command.lower():
        response['response'] = 'volume_up 1'    
    
    # You can add more commands here as needed



    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
