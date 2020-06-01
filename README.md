# sequencer
A Node JS tool for building UML sequence diagrams from a JSON or YAML definition.

There is a requirement to be able to define sequence diagrams used in system architecture definitions using a text based language that can be easily managed via source code repository schemes like GIT. Many applications that acheive this are expensive and require significant effort and overhead to maintain. Many online tools are available but are opioniated and provide little control over the grpahical presentation of the flow. 

This tool was written to be able to define sequence diagrams in an entirely textual format, like JSON or YAML, but also provide considerable control over look and feel using metadata within the file. 

## Design

The tool using Node JS. It reads a JSON sequence diagram description, and converts to either PDF or PNG using the Node Canvas solution provided at [https://www.npmjs.com/package/canvas](https://www.npmjs.com/package/canvas). YAML files are first converted to JSON by the tool prior to processing.

The main sections of the sequence diagram metadata description are:
* Title of the sequence diagram
* Version of the sequence diagram. _Note: this is a version presented on the sequyencer image directly and does not relate in any way to repository or file version metadata_
* Description (optional)
* Params. Entities within the diagram itself are assigned presentation metadata from one of 3 sources:
  * The entitiy definition itself, or (if not provided)
  * the Params provided presentation metadata for the entity, or (if not provided)
  * The default built-in opioninated presentation metadata
* The "actors" involved in the sequence diagram. There will be one actor per lifeline.
* The "lines" of the sequence diagram, ordered from the top of the flow to the bottom. Each line is defined with a type:
  * A **call** to define a flow from one actor to another (or itself)
  * A **return** to define the return from one actor to another
  * A **state** that presents a state or constraint on the actors lifeline
  * A **reference** that provides external use case or sequence file references
  * A **blank** line that just provides a define gap if needed between adjacent lines (may also include an unattached comment).
  * A **fragment** line that itself contains any of the above defined lines, given a form (e.g. "alt" condition flow, "loop", etc.), title and condition/definition. 
   * The fragment may also contain a **condtional** line, that breaks the fragment into sections, with the new section having it's own condition/definitino statetment applied.

## Usage
TBD

## Example
TBD

## TODO
Todo items:
  * Need to add sub-lifeline actions to actors such that parallel flows in the same actor are represented cleanly without having to resort to using 2 actors
  * Need to chase Canvas issues that present external TTF fonts to be deployed
  * Add schema vaidation on processing. At the moment, failures are normally represented by error boxes in the digram. In very exceptional cases memory or system errors have been encountered that cause crash of the application. This can be mitigated by enforcing validation of the sequencer description document before processing. 
