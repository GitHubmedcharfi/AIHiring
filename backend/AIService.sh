#!/bin/bash

echo "Starting AI Hiring Agent Services..."

start_container () {
  NAME=$1
  RUN_CMD=$2

  if [ "$(docker ps -aq -f name=^/${NAME}$)" ]; then
      if [ "$(docker ps -q -f name=^/${NAME}$)" ]; then
          echo "$NAME is already running."
      else
          echo "Starting existing container: $NAME"
          docker start $NAME
      fi
  else
      echo "Creating and starting container: $NAME"
      eval $RUN_CMD
  fi
}

# ------------------------------
# MaryTTS
# ------------------------------
start_container "marytts" \
"docker run -d \
--name marytts \
-p 59125:59125 \
--memory=6g \
--cpus=2 \
synesthesiam/marytts:5.2 \
--voice cmu-slt-hsmm"


# ------------------------------
# Ollama LLM
# ------------------------------
start_container "ollama-llm" \
"docker run -d \
--name ollama-llm \
-p 11434:11434 \
--memory=6g \
--cpus=4 \
ollama/ollama"


# wait for ollama to be ready
echo "Waiting for Ollama..."
sleep 10

# Pull model if not exists
if ! docker exec ollama-llm ollama list | grep -q "gemma:2b"; then
    echo "Pulling gemma:2b model..."
    docker exec ollama-llm ollama pull gemma:2b         
else
    echo "gemma:2b already installed." 
fi


# ------------------------------
# Whisper STT
# ------------------------------
start_container "whisper-asr" \
"docker run -d \
--name whisper-asr \
--memory=6g \
-p 9000:9000 \
-e MODEL=tiny \
onerahmet/openai-whisper-asr-webservice:v1.8.2"



echo "All AI services are ready "
echo "MaryTTS       : http://localhost:59125"
echo "Ollama API    : http://localhost:11434"
echo "Whisper ASR   : http://localhost:9000"
