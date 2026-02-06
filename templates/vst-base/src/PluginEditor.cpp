#include "PluginEditor.h"
#include "BinaryData.h"

// Window dimensions from plugin.config (passed via CMake)
#ifndef PLUGIN_WINDOW_WIDTH
#define PLUGIN_WINDOW_WIDTH 600
#endif
#ifndef PLUGIN_WINDOW_HEIGHT
#define PLUGIN_WINDOW_HEIGHT 400
#endif

PluginEditor::PluginEditor(PluginProcessor& p)
    : AudioProcessorEditor(&p)
    , processorRef(p)
{
    // CRITICAL: Register native functions BEFORE goToURL()
    webView = std::make_unique<juce::WebBrowserComponent>(
        juce::WebBrowserComponent::Options{}
            .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
            .withWinWebView2Options(
                juce::WebBrowserComponent::Options::WinWebView2{}
                    .withUserDataFolder(juce::File::getSpecialLocation(
                        juce::File::tempDirectory).getChildFile(JucePlugin_Name + juce::String("_WebView2"))))
            .withNativeIntegrationEnabled()

            // setParameter: Fire-and-forget for responsive UI
            .withNativeFunction("setParameter",
                [this](const juce::Array<juce::var>& args,
                       juce::WebBrowserComponent::NativeFunctionCompletion complete)
                {
                    if (args.size() >= 2)
                    {
                        auto paramId = args[0].toString();
                        auto value = static_cast<float>(args[1]);

                        if (auto* param = processorRef.apvts.getParameter(paramId))
                        {
                            param->setValueNotifyingHost(value);
                        }
                    }
                    complete(juce::var());
                })

            // getParameter: Returns current normalized value
            .withNativeFunction("getParameter",
                [this](const juce::Array<juce::var>& args,
                       juce::WebBrowserComponent::NativeFunctionCompletion complete)
                {
                    if (args.size() >= 1)
                    {
                        auto paramId = args[0].toString();

                        if (auto* param = processorRef.apvts.getParameter(paramId))
                        {
                            complete(param->getValue());
                            return;
                        }
                    }
                    complete(juce::var(0.0f));
                })

            // beginGesture: Start automation recording
            .withNativeFunction("beginGesture",
                [this](const juce::Array<juce::var>& args,
                       juce::WebBrowserComponent::NativeFunctionCompletion complete)
                {
                    if (args.size() >= 1)
                    {
                        auto paramId = args[0].toString();

                        if (auto* param = processorRef.apvts.getParameter(paramId))
                        {
                            param->beginChangeGesture();
                        }
                    }
                    complete(juce::var());
                })

            // endGesture: End automation recording
            .withNativeFunction("endGesture",
                [this](const juce::Array<juce::var>& args,
                       juce::WebBrowserComponent::NativeFunctionCompletion complete)
                {
                    if (args.size() >= 1)
                    {
                        auto paramId = args[0].toString();

                        if (auto* param = processorRef.apvts.getParameter(paramId))
                        {
                            param->endChangeGesture();
                        }
                    }
                    complete(juce::var());
                })

            // getParameterInfo: Returns info about all parameters
            .withNativeFunction("getParameterInfo",
                [this](const juce::Array<juce::var>& args,
                       juce::WebBrowserComponent::NativeFunctionCompletion complete)
                {
                    juce::ignoreUnused(args);
                    juce::DynamicObject::Ptr info = new juce::DynamicObject();

                    for (auto* param : processorRef.apvts.processor.getParameters())
                    {
                        if (auto* paramWithId = dynamic_cast<juce::RangedAudioParameter*>(param))
                        {
                            juce::DynamicObject::Ptr paramInfo = new juce::DynamicObject();
                            paramInfo->setProperty("value", paramWithId->getValue());
                            paramInfo->setProperty("defaultValue", paramWithId->getDefaultValue());
                            paramInfo->setProperty("name", paramWithId->getName(100));
                            info->setProperty(paramWithId->getParameterID(), paramInfo.get());
                        }
                    }

                    complete(juce::var(info.get()));
                })

            // Resource provider for serving embedded files
            .withResourceProvider([](const juce::String& url) { return getResource(url); },
                                  juce::URL(juce::WebBrowserComponent::getResourceProviderRoot()).getOrigin())
    );

    addAndMakeVisible(*webView);

    // Navigate to embedded UI
    webView->goToURL(juce::WebBrowserComponent::getResourceProviderRoot());

    setSize(PLUGIN_WINDOW_WIDTH, PLUGIN_WINDOW_HEIGHT);
    setResizable(false, false);
}

PluginEditor::~PluginEditor()
{
}

void PluginEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
}

void PluginEditor::resized()
{
    if (webView)
        webView->setBounds(getLocalBounds());
}

std::optional<juce::WebBrowserComponent::Resource> PluginEditor::getResource(const juce::String& url)
{
    // Map URL paths to BinaryData resources
    const auto urlToRetrieve = url == "/" ? juce::String("/index.html") : url;

    // Resource mappings
    static const std::map<juce::String, std::pair<const char*, int>> resources = {
        { "/index.html",    { BinaryData::index_html,      BinaryData::index_htmlSize } },
        { "/style.css",     { BinaryData::style_css,       BinaryData::style_cssSize } },
        { "/components.js", { BinaryData::components_js,   BinaryData::components_jsSize } },
        { "/bindings.js",   { BinaryData::bindings_js,     BinaryData::bindings_jsSize } }
    };

    auto it = resources.find(urlToRetrieve);
    if (it != resources.end())
    {
        // Determine MIME type
        juce::String mimeType = "application/octet-stream";
        if (urlToRetrieve.endsWith(".html"))
            mimeType = "text/html";
        else if (urlToRetrieve.endsWith(".css"))
            mimeType = "text/css";
        else if (urlToRetrieve.endsWith(".js"))
            mimeType = "application/javascript";

        return juce::WebBrowserComponent::Resource{
            std::vector<std::byte>(
                reinterpret_cast<const std::byte*>(it->second.first),
                reinterpret_cast<const std::byte*>(it->second.first) + it->second.second
            ),
            mimeType
        };
    }

    return std::nullopt;
}
