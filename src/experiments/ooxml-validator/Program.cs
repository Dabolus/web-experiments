using System;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Validation;
using DocumentFormat.OpenXml.Wordprocessing;

// This is only needed to let C# setup a program without a Main method
// Since we are not using any top-level logic, we are just explicitly returning 0,
// so that C# detection can work
// See: https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements
return 0;

public class ValidationError
{
    [JsonPropertyName("description"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string Description { get; set; }
    [JsonPropertyName("errorType")]
    public ValidationErrorType ErrorType { get; set; }
    [JsonPropertyName("id"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string Id { get; set; }
    [JsonPropertyName("xPath"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string XPath { get; set; }
    [JsonPropertyName("uri"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string Uri { get; set; }

    public ValidationError(ValidationErrorInfo errorInfo)
    {
        Description = errorInfo.Description;
        ErrorType = errorInfo.ErrorType;
        Id = errorInfo.Id;
        XPath = errorInfo.Path.XPath;
        Uri = errorInfo.Part.Uri.ToString();
    }
}

[JsonSerializable(typeof(ValidationError[]))]
internal partial class SourceGenerationContext : JsonSerializerContext { }

partial class WordprocessingDocumentValidator
{
    [JSExport]
    public static string Validate(string fileName, byte[] doc)
    {
        using (MemoryStream stream = new MemoryStream())
        {
            stream.Write(doc, 0, doc.Length);
            using (var document = getDocument(fileName, stream))
            {
                OpenXmlValidator validator = new OpenXmlValidator();
                ValidationError[] errors = validator
                    .Validate(document)
                    .Select(e => new ValidationError(e))
                    .ToArray();
                return JsonSerializer.Serialize(errors, typeof(ValidationError[]), SourceGenerationContext.Default);
            }
        }
    }

    private static OpenXmlPackage getDocument(string fileName, Stream stream)
    {
        string fileExt = Path.GetExtension(fileName).TrimStart('.');
        switch (fileExt)
        {
            case "docx":
                return WordprocessingDocument.Open(stream, false);
            case "xlsx":
                return SpreadsheetDocument.Open(stream, false);
            case "pptx":
                return PresentationDocument.Open(stream, false);
            default:
                throw new ArgumentException("Invalid file type");
        }
    }
}
