/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// We use a singleton pattern for the pipeline
let pipelineInstance = null;
async function getEmbedding(text) {
  if (!pipelineInstance) {
    const { pipeline } = await import('@xenova/transformers');
    pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
  }
  
  const result = await pipelineInstance(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

// Simple chunking logic: split by double newlines, group up to ~1000 characters
function chunkText(text, maxChars = 1000) {
  const paragraphs = text.split(/\r?\n\r?\n/);
  const chunks = [];
  let currentChunk = "";

  for (const p of paragraphs) {
    if (currentChunk.length + p.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = p + "\n\n";
    } else {
      currentChunk += p + "\n\n";
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

async function main() {
  console.log("Loading resume_data.txt...");
  const dataPath = path.join(__dirname, '..', 'public', 'resume_data.txt');
  const text = fs.readFileSync(dataPath, 'utf-8');
  
  console.log("Chunking text...");
  const chunks = chunkText(text);
  console.log(`Created ${chunks.length} chunks.`);

  // Clear existing knowledge base
  console.log("Clearing old knowledge base in Supabase...");
  const { error: deleteError } = await supabase.from('knowledge_base').delete().neq('id', 0);
  
  // Embed and insert each chunk
  console.log("Embedding and inserting chunks...");
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const embedding = await getEmbedding(chunk);
      
      const { error } = await supabase.from('knowledge_base').insert({
        content: chunk,
        embedding: embedding,
        metadata: { source: 'resume_data.txt', index: i }
      });
      
      if (error) {
        console.error(`Error inserting chunk ${i} (Make sure you updated SQL to 384 dimensions!):`, error.message);
      } else {
        process.stdout.write(`\rInserted chunk ${i + 1}/${chunks.length}`);
      }
    } catch (e) {
      console.error(`\nFailed to process chunk ${i}:`, e.message);
    }
  }
  console.log("\nIngestion complete!");
}

main().catch(console.error);
