use ollama_rs::Ollama;
use ollama_rs::generation::completion::request::GenerationRequest;

#[tauri::command]
pub async fn ollama_generate(model: String, prompt: String) -> Result<String, String> {
    let ollama = Ollama::default();

    match ollama.generate(GenerationRequest::new(model, prompt)).await {
        Ok(res) => Ok(res.response),
        Err(e) => Err(e.to_string()),
    }
}