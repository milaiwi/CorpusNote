// src-tauri/src/ollama.rs
use futures::stream::StreamExt;

use ollama_rs::Ollama;
use ollama_rs::generation::completion::request::GenerationRequest;
use tauri::Window;

#[tauri::command]
pub async fn ollama_generate(model: String, prompt: String) -> Result<String, String> {
    let ollama = Ollama::default();

    match ollama.generate(GenerationRequest::new(model, prompt)).await {
        Ok(res) => Ok(res.response),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn ollama_generate_stream(
    window: Window,
    model: String,
    prompt: String,
    onchunk: String
) -> Result<(), String> {
    let ollama = Ollama::default();

    let mut stream = ollama.generate_stream(GenerationRequest::new(model, prompt)).await.unwrap();

    while let Some(res) = stream.next().await {
        let responses = res.unwrap();
        for resp in responses {
            window.emit(&onchunk, resp.response).unwrap();
        }
    }

    Ok(())
}