<div align="center">

<br/>

# SteerSeg

#### Attention Steering for Reasoning Video Segmentation

<br/>

[![Python](https://img.shields.io/badge/Python-3.11_|_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.10-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![CUDA](https://img.shields.io/badge/CUDA-12.8-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://developer.nvidia.com/cuda-downloads)
[![License](https://img.shields.io/badge/License-Apache_2.0-1f6feb?style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)

<br/>

<sub>

**[ 📖 Details ](video-reason-segmentaion/docs/DETAILS.md)** &nbsp;·&nbsp;
**[ 🚀 Setup ](#-setup)** &nbsp;·&nbsp;
**[ 🧠 Models ](#-model-checkpoints)** &nbsp;·&nbsp;
**[ 📂 Datasets ](#-datasets)** &nbsp;·&nbsp;
**[ 📜 Cite ](#-citation)**

</sub>

</div>

![Method overview](docs/assets/blockdiagram.png)

---

## ✨ Highlights

- 🪶 **Tiny footprint** — only two soft prompts (~480 KB) trained; everything else stays frozen.
- 🧩 **Plug-and-play backbones** — Qwen2.5-VL · Qwen2-VL · LLaVA-OneVision · InternVL3 · Qwen3.5.
- 🎯 **Cross-scale attention fusion** — weighted Pearson score over frame + video rollouts.
- ⚡ **Skip training** — pre-trained soft prompts ship with the repo; jump straight to inference.

---

## 🚀 Setup

> [!IMPORTANT]
> **Requirements** — CUDA-capable GPU · Python 3.11 / 3.12 · ~50 GB free disk for checkpoints.

<br/>

**1.** Clone the repo

```bash
git clone https://github.com/alichr/nips26-video-reason-segmentaion.git rvos
cd rvos
```

**2.** Create the main environment

```bash
python3.12 -m venv venv
source venv/bin/activate

# PyTorch (CUDA 12.8)
pip install torch==2.10.0 torchvision==0.25.0 \
  --extra-index-url https://download.pytorch.org/whl/cu128

# Project
pip install -e .
```

**3.** Build SAM 2 (vendored)

```bash
cd third_parts/sam2
python -m pip install --no-build-isolation -v -e .
cd ../..
```

> [!TIP]
> If SAM 2's CUDA extension fails to build (nvcc / torch CUDA mismatch), set
> `SAM2_BUILD_CUDA=0` to fall back to the slower pure-PyTorch path.

<details>
<summary><b>🧪 Optional — <code>venv5</code> for the Qwen3.5-9B ablation backbone</b></summary>

<br/>

Qwen3.5-9B needs `transformers >= 5.0`, which conflicts with the four primary backbones.
Build a **parallel** environment only when working with Qwen3.5:

```bash
python3.12 -m venv venv5
./venv5/bin/pip install --upgrade pip
./venv5/bin/pip install torch==2.10.0 torchvision==0.25.0 \
  --extra-index-url https://download.pytorch.org/whl/cu128
./venv5/bin/pip install transformers==5.7.0 qwen-vl-utils 'numpy<2' \
  opencv-python matplotlib einops accelerate Pillow huggingface_hub \
  pycocotools scipy tqdm
```

</details>

---

## 🧠 Model Checkpoints

> All checkpoints land under `ckpts/`. The Hugging Face CLI is required.

```bash
pip install "huggingface_hub[cli]"
mkdir -p ckpts
```

### 🎯 SAM 2 — required

```bash
mkdir -p ckpts/sam2-hiera-large
wget -P ckpts/sam2-hiera-large/ \
  https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_large.pt
cp third_parts/sam2/sam2/configs/sam2/sam2_hiera_l.yaml ckpts/sam2-hiera-large/
```

### 🧠 Vision-Language Backbones

<table>
<thead>
<tr><th>Backbone</th><th>Role</th><th>Hugging Face ID</th></tr>
</thead>
<tbody>
<tr>
  <td><b>Qwen2.5-VL-7B</b> ⭐</td>
  <td>Headline pipeline</td>
  <td><code>Qwen/Qwen2.5-VL-7B-Instruct</code></td>
</tr>
<tr>
  <td>Qwen2-VL-7B</td>
  <td>Ablation</td>
  <td><code>Qwen/Qwen2-VL-7B-Instruct</code></td>
</tr>
<tr>
  <td>LLaVA-OneVision-7B</td>
  <td>Ablation</td>
  <td><code>llava-hf/llava-onevision-qwen2-7b-ov-hf</code></td>
</tr>
<tr>
  <td>InternVL3-8B</td>
  <td>Ablation</td>
  <td><code>OpenGVLab/InternVL3-8B-hf</code></td>
</tr>
<tr>
  <td>Qwen3.5-9B</td>
  <td>Ablation · needs <code>venv5</code></td>
  <td><code>Qwen/Qwen3.5-9B</code></td>
</tr>
</tbody>
</table>

Download a backbone with:

```bash
huggingface-cli download <HF_ID> --local-dir ckpts/<dir>
# e.g.
huggingface-cli download Qwen/Qwen2.5-VL-7B-Instruct \
  --local-dir ckpts/Qwen2.5-VL-7B-Instruct
```

> [!NOTE]
> **Pre-trained soft prompts** (~480 KB each) for all four primary backbones already
> ship with this repo under `frame_only/`, `video_only/`,
> `frame_only_sp_hw_n64_oneEpoch_extval/`, and `video_only_sp_hw_n64_oneEpoch_extval/`.
> You can **skip Stage 0 entirely** and jump straight to inference.

---

## 📂 Datasets

> Datasets live under `datasets/RVOSJoint/`.

```bash
mkdir -p datasets/RVOSJoint && cd datasets/RVOSJoint
```

### 🎬 DAVIS17 + ReasonVOS — required for inference

```bash
huggingface-cli download js-hyun/decaf_data --repo-type dataset --local-dir .
tar -xf davis17_data.tar    2>/dev/null || tar -xf RVOSJoint/davis17_data.tar
tar -xf reasonvos_data.tar  2>/dev/null || tar -xf RVOSJoint/reasonvos_data.tar
```

### 📺 Ref-YouTube-VOS — only for Stage-0 re-training

```bash
pip install gdown
gdown --folder https://drive.google.com/drive/folders/1xSXyds6d3ARViqwhAdxK268CJKP6vfZh -O .
tar -xf ref-youtube-vos.tar 2>/dev/null
cd ../..
```

> Mirror: <https://youtube-vos.org/dataset/rvos/>

---

## 📁 Expected Layout

```text
rvos/
├── ckpts/
│   ├── sam2-hiera-large/
│   ├── Qwen2.5-VL-7B-Instruct/
│   └── ...                       # other backbones (optional)
└── datasets/RVOSJoint/
    ├── davis17/                  # DAVIS17  (decaf_data)
    ├── ReasonVOS/                # ReasonVOS (decaf_data)
    └── ref-youtube-vos/          # Stage-0 only
        ├── meta_expressions/{train,valid,test}/
        ├── train/{JPEGImages, Annotations, meta.json}
        └── valid/{JPEGImages, Annotations, meta_expressions_challenge.json}
```

---

## 📜 Citation

```bibtex
@inproceedings{cheraghian2026steerseg,
  title     = {SteerSeg: Attention Steering for Reasoning Video Segmentation},
  author    = {Cheraghian, Ali and Dastmalchi, Hamidreza},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year      = {2026}
}
```

<br/>

<div align="center">
<sub>Released under the Apache 2.0 License.</sub>
</div>
