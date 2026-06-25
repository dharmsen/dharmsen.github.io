---
title: "Understanding the Effect of Post-Training Quantization on Large Language Models"
authors: ["Dalton Harmsen"]
venue: "tue.nl"
year: 2024
type: "thesis"
pdf: "/papers/masterthesis.pdf"
arxiv: ""
code: "https://github.com/Generative-AI-TUe/msc-project-1293885"
highlight: true
---

Supervised by Jakub M. Tomczak

Transformers are currently widely adopted and utilized in the artificial
intelligence research space. They do however face scalability and sustainability
challenges due to resource-intensive training and inference. Post-training
quantization (PTQ), a method for reducing computational and environmental costs,
involves using lower bit precision representations of model parameters. The
effect, and reasoning behind, the trade-off that PTQ makes in performance is not
widely studied. This research investigates the impact of PTQ on transformer
models, focusing on large language models (LLMs). The study explores how PTQ 
affects the performance and behavior of transformer models quantized on a range
of bit precisions. The performance of a range of LLMs, quantized on a range of
PTQ methods, is measured on a range of benchmark tasks. To this end, a
controlled experimental environment is developed. Metrics such as model size,
inference time, and benchmark scores are evaluated. The effect of PTQ is
quantified on a large scale, showcasing the performance degradation on lower bit
precisions across different axes such as training, task and architecture.