import type { ContentBlock } from "@/types/chat";

type ParseState = "TEXT" | "THINKING" | "TOOL" | "RESULT";

export interface ParsedContent {
  blocks: ContentBlock[];
}

export class StreamParser {
  private state: ParseState = "TEXT";
  private buffer = "";
  private tagBuffer = "";
  private currentThinkContent = "";
  private currentToolContent = "";
  private currentResultContent = "";
  private textBuffer = "";

  private result: ParsedContent = {
    blocks: [],
  };

  parse(chunk: string): ParsedContent {
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];
      this.processChar(char);
    }
    // 处理剩余的文本缓冲区
    if (this.textBuffer) {
      this.addTextBlock();
    }
    return { blocks: [...this.result.blocks] };
  }

  private addTextBlock() {
    if (this.textBuffer.trim()) {
      // 检查最后一个 block 是否是 text，如果是则合并
      const lastBlock = this.result.blocks[this.result.blocks.length - 1];
      if (lastBlock && lastBlock.type === 'text') {
        lastBlock.content += this.textBuffer;
      } else {
        this.result.blocks.push({ type: 'text', content: this.textBuffer });
      }
      this.textBuffer = "";
    }
  }

  private processChar(char: string) {
    if (this.state === "TEXT") {
      if (char === "<") {
        this.tagBuffer = "<";
        this.state = "TAG_START" as ParseState;
      } else {
        this.textBuffer += char;
      }
    } else if (this.state === ("TAG_START" as ParseState)) {
      this.tagBuffer += char;
      if (this.tagBuffer === "<think>") {
        // 保存之前的文本
        this.addTextBlock();
        this.state = "THINKING";
        this.currentThinkContent = "";
        this.tagBuffer = "";
      } else if (this.tagBuffer === "<tool>") {
        // 保存之前的文本
        this.addTextBlock();
        this.state = "TOOL";
        this.currentToolContent = "";
        this.tagBuffer = "";
      } else if (this.tagBuffer === "<result>") {
        this.state = "RESULT";
        this.currentResultContent = "";
        this.tagBuffer = "";
      } else if (!["<t", "<to", "<too", "<r", "<re", "<res", "<resu", "<resul"].some(prefix => 
        this.tagBuffer.startsWith(prefix)
      )) {
        // 不是标签，回退到文本
        this.textBuffer += this.tagBuffer;
        this.state = "TEXT";
        this.tagBuffer = "";
      }
    } else if (this.state === "THINKING") {
      if (char === "<" && this.buffer === "") {
        this.buffer = "<";
      } else if (this.buffer === "<" && char === "/") {
        this.buffer = "</";
      } else if (this.buffer === "</" && char === "t") {
        this.buffer = "</t";
      } else if (this.buffer === "</t" && char === "h") {
        this.buffer = "</th";
      } else if (this.buffer === "</th" && char === "i") {
        this.buffer = "</thi";
      } else if (this.buffer === "</thi" && char === "n") {
        this.buffer = "</thin";
      } else if (this.buffer === "</thin" && char === "k") {
        this.buffer = "</think";
      } else if (this.buffer === "</think" && char === ">") {
        // 闭合标签完成，添加 think block
        // 检查是否是连续的 think 块
        const lastBlock = this.result.blocks[this.result.blocks.length - 1];
        if (lastBlock && lastBlock.type === 'think') {
          // 合并到上一个 think 块
          lastBlock.content += this.currentThinkContent;
        } else {
          this.result.blocks.push({ type: 'think', content: this.currentThinkContent });
        }
        this.currentThinkContent = "";
        this.state = "TEXT";
        this.buffer = "";
      } else {
        // 不是闭合标签，将 buffer 内容追加到当前 think
        if (this.buffer) {
          this.currentThinkContent += this.buffer;
          this.buffer = "";
        }
        this.currentThinkContent += char;
      }
    } else if (this.state === "TOOL") {
      if (char === "<" && this.buffer === "") {
        this.buffer = "<";
      } else if (this.buffer === "<" && char === "/") {
        this.buffer = "</";
      } else if (this.buffer === "</" && char === "t") {
        this.buffer = "</t";
      } else if (this.buffer === "</t" && char === "o") {
        this.buffer = "</to";
      } else if (this.buffer === "</to" && char === "o") {
        this.buffer = "</too";
      } else if (this.buffer === "</too" && char === "l") {
        this.buffer = "</tool";
      } else if (this.buffer === "</tool" && char === ">") {
        // 闭合标签完成，解析 JSON 并添加 tool block
        try {
          const toolData = JSON.parse(this.currentToolContent);
          this.result.blocks.push({
            type: 'tool',
            request: {
              id: toolData.id,
              name: toolData.name,
              argument: toolData.argument,
            }
          });
        } catch {
          // JSON 解析失败，忽略
        }
        this.currentToolContent = "";
        this.state = "TEXT";
        this.tagBuffer = "";
        this.buffer = "";
      } else {
        if (this.buffer) {
          this.currentToolContent += this.buffer;
          this.buffer = "";
        }
        this.currentToolContent += char;
      }
    } else if (this.state === "RESULT") {
      if (char === "<" && this.buffer === "") {
        this.buffer = "<";
      } else if (this.buffer === "<" && char === "/") {
        this.buffer = "</";
      } else if (this.buffer === "</" && char === "r") {
        this.buffer = "</r";
      } else if (this.buffer === "</r" && char === "e") {
        this.buffer = "</re";
      } else if (this.buffer === "</re" && char === "s") {
        this.buffer = "</res";
      } else if (this.buffer === "</res" && char === "u") {
        this.buffer = "</resu";
      } else if (this.buffer === "</resu" && char === "l") {
        this.buffer = "</resul";
      } else if (this.buffer === "</resul" && char === "t") {
        this.buffer = "</result";
      } else if (this.buffer === "</result" && char === ">") {
        // 闭合标签完成，解析 JSON 并更新最后一个 tool block 的 response
        try {
          const resultData = JSON.parse(this.currentResultContent);
          // 找到最后一个 tool block 并添加 response
          const lastToolBlock = [...this.result.blocks].reverse().find(b => b.type === 'tool');
          if (lastToolBlock && lastToolBlock.type === 'tool') {
            lastToolBlock.response = {
              id: resultData.id,
              toolName: resultData.toolName,
              text: resultData.text,
              isError: resultData.isError,
            };
          }
        } catch {
          // JSON 解析失败，忽略
        }
        this.currentResultContent = "";
        this.state = "TEXT";
        this.tagBuffer = "";
        this.buffer = "";
      } else {
        if (this.buffer) {
          this.currentResultContent += this.buffer;
          this.buffer = "";
        }
        this.currentResultContent += char;
      }
    }
  }

  reset() {
    this.state = "TEXT";
    this.buffer = "";
    this.tagBuffer = "";
    this.currentThinkContent = "";
    this.currentToolContent = "";
    this.currentResultContent = "";
    this.textBuffer = "";
    this.result = {
      blocks: [],
    };
  }

  getResult(): ParsedContent {
    return { blocks: [...this.result.blocks] };
  }
}
