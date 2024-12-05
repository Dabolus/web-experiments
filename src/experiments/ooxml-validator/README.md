# Office Open XML Validator

## What is it?

Office Open XML Validator is a simple tool to validate [Office Open XML](https://en.wikipedia.org/wiki/Office_Open_XML)
files. It is built using the [.NET Open XML SDK](https://learn.microsoft.com/en-us/office/open-xml/open-xml-sdk),
which is the most reliable validator available since it is the official SDK
provided by Microsoft. To make it run in the browser, a tiny wrapper of the SDK
is compiled to WebAssembly and called from TypeScript. This means not only that
the validation is 100% accurate, but also that it is done completely client-side
and no data is sent to any server.

## Why?

I was building a web application that needed to generate .docx files,
but the output was not always correct and Word wasn't able to open them.

While looking online for a solution, I couldn't find a reliable validator
that told me what was wrong with the files. I did however find a [guide by Microsoft](https://learn.microsoft.com/en-us/office/open-xml/word/how-to-validate-a-word-processing-document)
that explained how to perform the validation programmatically in .NET.

After running the script in the guide successfully in my Windows PC, I thought
it would be much easier to be able to run it also on my Mac. Instead of trying
to compile the .NET code natively for my Mac though, I thought it would have been
cooler to make it work on the fly in a browser, and here we are.

## How?

Compiling .NET to WASM was easier than I expected. After installing [.NET](https://dotnet.microsoft.com/en-us/),
I just had to install the proper workloads needed to work with WASM:

```bash
dotnet workload install wasm-tools
dotnet workload install wasm-experimental
```

Then I used the WASM browser template that Microsoft provides:

```bash
dotnet new wasmbrowser
```

This template already provides everything necessary to start using .NET in the
browser. I then installed the Open XML SDK:

```bash
dotnet add package DocumentFormat.OpenXml
```

And created a class that uses the SDK to validate the files provided as input
from the browser.

To wrap everything up, I created a nice frontend using [Fluent UI](https://developer.microsoft.com/en-us/fluentui)
to give it the look and feel of a Microsoft product.

## Who?

This tool was built with ❤️ by [Dabolus](https://giorgio.garasto.me).
