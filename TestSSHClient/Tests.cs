using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace TestSSHClient
{
	[TestClass]
	public class Tests
	{
		[TestMethod]
		public void TestDefinitionParser()
		{
			string line = "";
			var testUrl = "http://http://pinkibrejn2.playkontrol.com";

			var ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message, "Line is empty");

			line = ";";
			ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message,"Url definition empty");

			line = $"{testUrl}:8072?cmd=getdata";
			var result = TestDefinition.ParseDefinition(line);
			Assert.AreEqual(result.Url, line);

			line = $"{testUrl}{{port}}?cmd=getdata;";
			ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message, "Ports definition empty");

			line = $"{testUrl}:{{port}}?cmd=getdata&kb=1000;abc";
			ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message, "Port value can't be parsed as number");

			line = $"{testUrl}:{{port}}?cmd=getdata&kb=1000;8072-xxx";
			ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message, "Port value can't be parsed as number");

			line = $"{testUrl}:{{port}}?cmd=getdata&kb=1000;8072";
			result = TestDefinition.ParseDefinition(line);
			Assert.AreEqual(result.PortFrom,8072);
			Assert.AreEqual(result.PortTo, 8072);

			line = $"{testUrl}:{{port}}?cmd=getdata&kb=1000;8072-8080";
			result = TestDefinition.ParseDefinition(line);
			Assert.AreEqual(result.PortFrom, 8072);
			Assert.AreEqual(result.PortTo, 8080);

			line = $"{testUrl}:{{port}}?cmd=getdata&kb={{size}};8072-8080;";
			ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message, "Data size definition empty");

			line = $"{testUrl}:{{port}}?cmd=getdata&kb={{size}};8072-8080;xxx";
			ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message, "Data size value can't be parsed as number");

			line = $"{testUrl}:{{port}}?cmd=getdata&kb={{size}};8072-8080;1000-xxx";
			ex = Assert.ThrowsException<ArgumentException>(() => TestDefinition.ParseDefinition(line));
			Assert.AreEqual(ex.Message, "Data size value can't be parsed as number");

			line = $"{testUrl}:{{port}}?cmd=getdata&kb={{size}};8072-8080;1000";
			result = TestDefinition.ParseDefinition(line);
			Assert.AreEqual(result.DataSizeFrom, 1000);
			Assert.AreEqual(result.DataSizeTo, 1000);

			line = $"{testUrl}:{{port}}?cmd=getdata&kb={{size}};8072-8080;1000-3000";
			result = TestDefinition.ParseDefinition(line);
			Assert.AreEqual(result.DataSizeFrom, 1000);
			Assert.AreEqual(result.DataSizeTo, 3000);
		}
	}
}
